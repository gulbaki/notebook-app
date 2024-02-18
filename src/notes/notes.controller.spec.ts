import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

const mockNotesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('NotesController', () => {
  let controller: NotesController;
  let service: NotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [{ provide: NotesService, useValue: mockNotesService }],
    }).compile();

    controller = module.get<NotesController>(NotesController);
    service = module.get<NotesService>(NotesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call notesService.create with the provided note and return the result', async () => {
      const reqMock = { user: { userId: 'user1' } };
      const noteDto: CreateNoteDto = {
        title: 'Test Note',
        description: 'This is a test note.',
        userId: '',
      };
      const expectedNote = { ...noteDto, userId: reqMock.user.userId };

      mockNotesService.create.mockResolvedValue(expectedNote);

      const result = await controller.create(noteDto, reqMock);
      expect(result).toEqual(expectedNote);
      expect(mockNotesService.create).toHaveBeenCalledWith(expectedNote);
    });
  });

  describe('findAll', () => {
    it('should call notesService.findAll and return the result', async () => {
      const expectedNotes = [
        { title: 'Note 1', content: 'Content 1', userId: 'user1' },
      ];
      mockNotesService.findAll.mockResolvedValue(expectedNotes);

      const result = await controller.findAll();
      expect(result).toEqual(expectedNotes);
      expect(mockNotesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call notesService.findOne with id and return the result', async () => {
      const noteId = 'note1';
      const expectedNote = {
        title: 'Note 1',
        content: 'Content 1',
        userId: 'user1',
      };
      mockNotesService.findOne.mockResolvedValue(expectedNote);

      const result = await controller.findOne(noteId);
      expect(result).toEqual(expectedNote);
      expect(mockNotesService.findOne).toHaveBeenCalledWith(noteId);
    });
  });

  describe('update', () => {
    it('should call notesService.update with id and updateNoteDto and return the result', async () => {
      const noteId = 'note1';
      const updateNoteDto: UpdateNoteDto = {
        title: 'Updated Note',
        description: 'Updated content.',
      };
      const expectedNote = { ...updateNoteDto, userId: 'user1' };

      mockNotesService.update.mockResolvedValue(expectedNote);

      const result = await controller.update(noteId, updateNoteDto);
      expect(result).toEqual(expectedNote);
      expect(mockNotesService.update).toHaveBeenCalledWith(
        noteId,
        updateNoteDto,
      );
    });
  });

  describe('remove', () => {
    it('should call notesService.remove with id and return the result', async () => {
      const noteId = 'note1';
      const expectedResponse = { deleted: true };
      mockNotesService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove(noteId);
      expect(result).toEqual(expectedResponse);
      expect(mockNotesService.remove).toHaveBeenCalledWith(noteId);
    });
  });
});
