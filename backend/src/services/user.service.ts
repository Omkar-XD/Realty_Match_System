import { UserService } from '../../../src/services/user.service';
import { UserRepository } from '../../../src/repositories/user.repository';
import { CreateUserDTO, UpdateUserDTO } from '../../../src/types';
import { NotFoundError, ValidationError } from '../../../src/utils/error.util';

// Mock the repository
jest.mock('../../../src/repositories/user.repository');
jest.mock('../../../src/utils/password.util');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepo = mockUserRepo;
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          role: 'staff' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockUserRepo.findAll.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        role: 'staff' as const,
        password_hash: 'hashed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('1');

      expect(result).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        role: 'staff',
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
      });
    });

    it('should throw NotFoundError when user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(userService.getUserById('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const createUserDTO: CreateUserDTO = {
        name: 'New User',
        email: 'new@example.com',
        phone: '9876543210',
        role: 'staff',
        password: 'password123',
      };

      const mockCreatedUser = {
        id: '2',
        name: 'New User',
        email: 'new@example.com',
        phone: '9876543210',
        role: 'staff' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(createUserDTO);

      expect(result).toEqual(mockCreatedUser);
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUserRepo.create).toHaveBeenCalled();
    });

    it('should throw ValidationError when email already exists', async () => {
      const createUserDTO: CreateUserDTO = {
        name: 'New User',
        email: 'existing@example.com',
        phone: '9876543210',
        role: 'staff',
        password: 'password123',
      };

      mockUserRepo.findByEmail.mockResolvedValue({
        id: '1',
        name: 'Existing User',
        email: 'existing@example.com',
        phone: '1234567890',
        role: 'staff',
        password_hash: 'hashed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await expect(userService.createUser(createUserDTO)).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateDTO: UpdateUserDTO = {
        name: 'Updated Name',
      };

      const existingUser = {
        id: '1',
        name: 'Old Name',
        email: 'test@example.com',
        phone: '1234567890',
        role: 'staff' as const,
        password_hash: 'hashed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedUser = {
        id: '1',
        name: 'Updated Name',
        email: 'test@example.com',
        phone: '1234567890',
        role: 'staff' as const,
        created_at: existingUser.created_at,
        updated_at: new Date().toISOString(),
      };

      mockUserRepo.findById.mockResolvedValue(existingUser);
      mockUserRepo.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('1', updateDTO);

      expect(result.name).toBe('Updated Name');
      expect(mockUserRepo.update).toHaveBeenCalledWith('1', updateDTO);
    });

    it('should throw NotFoundError when user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(userService.updateUser('999', { name: 'Test' })).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        role: 'staff' as const,
        password_hash: 'hashed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.delete.mockResolvedValue(undefined);

      await userService.deleteUser('1');

      expect(mockUserRepo.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundError when user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(userService.deleteUser('999')).rejects.toThrow(NotFoundError);
    });
  });
});