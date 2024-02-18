import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { getModelToken } from '@nestjs/mongoose';
import { Note } from './note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

// Mocking the Note model
const mockNoteModel = {
  new: jest.fn().mockResolvedValue({}),
  constructor: jest.fn().mockResolvedValue({}),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  save: jest.fn(),
};

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getModelToken(Note.name),
          useValue: mockNoteModel,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    jest.clearAllMocks(); // Reset mocks between tests
  });

  describe('create', () => {
    it('should successfully create a note', async () => {
      const createNoteDto: CreateNoteDto = {
        title: 'Test Note',
        description: 'This is a test',
        userId: '',
      };
      mockNoteModel.save.mockResolvedValue(createNoteDto);

      expect(await service.create(createNoteDto)).toEqual(createNoteDto);
      expect(mockNoteModel.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of notes', async () => {
      const result = [{ title: 'Test Note', content: 'This is a test' }];
      mockNoteModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(result),
      });

      expect(await service.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single note', async () => {
      const note = {
        _id: 'someId',
        title: 'Test Note',
        content: 'This is a test',
      };
      mockNoteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(note),
      });

      expect(await service.findOne('someId')).toEqual(note);
    });
  });

  describe('update', () => {
    it('should update a note and return the updated note', async () => {
      const updateNoteDto: UpdateNoteDto = { title: 'Updated Title' };
      const updatedNote = { _id: 'someId', ...updateNoteDto };
      mockNoteModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(updatedNote),
      });

      expect(await service.update('someId', updateNoteDto)).toEqual(
        updatedNote,
      );
    });
  });

  describe('remove', () => {
    it('should remove a note', async () => {
      mockNoteModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await service.remove('someId');
      expect(mockNoteModel.findByIdAndDelete).toHaveBeenCalledWith('someId');
    });
  });
});
