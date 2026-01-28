import { PropertyRepository } from '../repositories/property.repository';
import { EnquiryRepository } from '../repositories/enquiry.repository';
import { NotFoundError } from '../utils/error.util';
import { logger } from '../utils/logger.util';
import type { Property } from '../types/property.types';
import type { BuyerRequirement } from '../types/enquiry.types';

/**
 * Matching Service
 * 
 * Intelligent property matching algorithm
 */

export class MatchingService {
  /**
   * Find matching properties for a buyer requirement
   */
  static async findMatchingProperties(requirementId: string): Promise<{
    requirement: BuyerRequirement;
    matches: Array<Property & { matchScore: number; matchReasons: string[] }>;
    totalMatches: number;
  }> {
    // Get the buyer requirement
    const requirement = await EnquiryRepository.findRequirementById(requirementId);
    
    if (!requirement) {
      throw new NotFoundError('Buyer requirement not found');
    }

    logger.info(`Finding matches for requirement: ${requirementId}`);

    // Find matching properties from database
    const properties = await PropertyRepository.findMatchingProperties({
      property_type: requirement.property_type as any,
      looking_for: requirement.looking_for,
      budget_min: requirement.budget_min,
      budget_max: requirement.budget_max,
      area_min: requirement.area_min || undefined,
      area_max: requirement.area_max || undefined,
      preferred_areas: requirement.preferred_areas
    });

    // Score and sort matches
    const scoredMatches = properties
      .map(property => this.scoreMatch(requirement, property))
      .sort((a, b) => b.matchScore - a.matchScore);

    logger.info(`Found ${scoredMatches.length} matches for requirement ${requirementId}`);

    return {
      requirement,
      matches: scoredMatches,
      totalMatches: scoredMatches.length
    };
  }

  /**
   * Calculate match score and reasons for a property-requirement pair
   */
  private static scoreMatch(
    requirement: BuyerRequirement,
    property: Property
  ): Property & { matchScore: number; matchReasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Base score for matching property type and transaction type (mandatory)
    score += 30;
    reasons.push(`Matches ${requirement.property_type} property type`);
    reasons.push(`Available for ${requirement.looking_for === 'buy' ? 'sale' : 'rent'}`);

    // Price matching (30 points)
    const priceScore = this.calculatePriceScore(
      property.price,
      requirement.budget_min,
      requirement.budget_max
    );
    score += priceScore;
    
    if (priceScore === 30) {
      reasons.push(`Perfect price match (₹${this.formatPrice(property.price)})`);
    } else if (priceScore >= 20) {
      reasons.push(`Good price match (₹${this.formatPrice(property.price)})`);
    } else if (priceScore >= 10) {
      reasons.push(`Acceptable price (₹${this.formatPrice(property.price)})`);
    }

    // Area matching (20 points) - if specified
    if (requirement.area_min || requirement.area_max) {
      const areaScore = this.calculateAreaScore(
        property.area,
        requirement.area_min,
        requirement.area_max
      );
      score += areaScore;
      
      if (areaScore === 20) {
        reasons.push(`Perfect area match (${property.area} sq.ft.)`);
      } else if (areaScore >= 10) {
        reasons.push(`Good area match (${property.area} sq.ft.)`);
      }
    } else {
      // If no area requirement, give partial points
      score += 10;
    }

    // Location matching (20 points)
    const locationScore = this.calculateLocationScore(
      property.location,
      requirement.preferred_areas
    );
    score += locationScore;
    
    if (locationScore === 20) {
      reasons.push(`Preferred location: ${property.location}`);
    } else if (locationScore >= 10) {
      reasons.push(`Location: ${property.location}`);
    }

    // Property subtype bonus (optional, up to 10 points)
    if (requirement.property_subtype.toLowerCase() === property.property_subtype.toLowerCase()) {
      score += 10;
      reasons.push(`Exact subtype match: ${property.property_subtype}`);
    }

    return {
      ...property,
      matchScore: Math.min(score, 100), // Cap at 100
      matchReasons: reasons
    };
  }

  /**
   * Calculate price match score (0-30 points)
   */
  private static calculatePriceScore(
    propertyPrice: number,
    budgetMin: number,
    budgetMax: number
  ): number {
    // Perfect match: within budget range
    if (propertyPrice >= budgetMin && propertyPrice <= budgetMax) {
      // Score higher if closer to middle of budget
      const budgetMid = (budgetMin + budgetMax) / 2;
      const deviation = Math.abs(propertyPrice - budgetMid) / (budgetMax - budgetMin);
      return Math.round(30 - (deviation * 10)); // 20-30 points
    }

    // Slightly over budget (within 10%)
    const overBudget = (propertyPrice - budgetMax) / budgetMax;
    if (overBudget > 0 && overBudget <= 0.1) {
      return 15; // 15 points for slightly over
    }

    // Slightly under minimum (within 10%)
    const underBudget = (budgetMin - propertyPrice) / budgetMin;
    if (underBudget > 0 && underBudget <= 0.1) {
      return 10; // 10 points for slightly under
    }

    // Too far from budget
    return 0;
  }

  /**
   * Calculate area match score (0-20 points)
   */
  private static calculateAreaScore(
    propertyArea: number,
    areaMin?: number | null,
    areaMax?: number | null
  ): number {
    // If no area constraints, give partial points
    if (!areaMin && !areaMax) {
      return 10;
    }

    const min = areaMin || 0;
    const max = areaMax || Infinity;

    // Perfect match: within area range
    if (propertyArea >= min && propertyArea <= max) {
      // Score higher if closer to desired range
      if (areaMin && areaMax) {
        const areaMid = (min + max) / 2;
        const deviation = Math.abs(propertyArea - areaMid) / (max - min);
        return Math.round(20 - (deviation * 5)); // 15-20 points
      }
      return 20;
    }

    // Slightly outside range (within 15%)
    if (areaMin && propertyArea < min) {
      const underArea = (min - propertyArea) / min;
      if (underArea <= 0.15) return 10;
    }

    if (areaMax && propertyArea > max) {
      const overArea = (propertyArea - max) / max;
      if (overArea <= 0.15) return 10;
    }

    // Too far from desired area
    return 0;
  }

  /**
   * Calculate location match score (0-20 points)
   */
  private static calculateLocationScore(
    propertyLocation: string,
    preferredAreas: string[]
  ): number {
    if (!preferredAreas || preferredAreas.length === 0) {
      return 10; // Neutral score if no preference
    }

    const locationLower = propertyLocation.toLowerCase();
    
    // Check for exact match
    for (const area of preferredAreas) {
      if (locationLower === area.toLowerCase()) {
        return 20; // Perfect match
      }
    }

    // Check for partial match (contains preferred area name)
    for (const area of preferredAreas) {
      if (locationLower.includes(area.toLowerCase()) || area.toLowerCase().includes(locationLower)) {
        return 15; // Good match
      }
    }

    // No match with preferred areas
    return 5; // Low score but not zero
  }

  /**
   * Format price for display
   */
  private static formatPrice(price: number): string {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(2)} L`;
    }
    return price.toString();
  }

  /**
   * Get match summary statistics
   */
  static getMatchSummary(matches: Array<Property & { matchScore: number }>): {
    total: number;
    excellent: number; // 80-100
    good: number; // 60-79
    fair: number; // 40-59
    poor: number; // 0-39
  } {
    return {
      total: matches.length,
      excellent: matches.filter(m => m.matchScore >= 80).length,
      good: matches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length,
      fair: matches.filter(m => m.matchScore >= 40 && m.matchScore < 60).length,
      poor: matches.filter(m => m.matchScore < 40).length
    };
  }

  /**
   * Find best matches (top N with score >= threshold)
   */
  static async findBestMatches(
    requirementId: string,
    minScore: number = 60,
    limit: number = 10
  ): Promise<Array<Property & { matchScore: number; matchReasons: string[] }>> {
    const { matches } = await this.findMatchingProperties(requirementId);
    
    return matches
      .filter(match => match.matchScore >= minScore)
      .slice(0, limit);
  }

  /**
   * Batch match multiple requirements
   */
  static async batchMatchRequirements(requirementIds: string[]): Promise<Map<string, number>> {
    const results = new Map<string, number>();

    for (const requirementId of requirementIds) {
      try {
        const { totalMatches } = await this.findMatchingProperties(requirementId);
        results.set(requirementId, totalMatches);
      } catch (error) {
        logger.error(`Failed to match requirement ${requirementId}:`, error);
        results.set(requirementId, 0);
      }
    }

    return results;
  }
}