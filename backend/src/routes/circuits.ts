import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Todas las rutas de circuitos requieren autenticación
router.use(authenticateToken);

// GET /api/circuits - Listar todos los circuitos del usuario
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const circuits = await prisma.circuit.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, createdAt: true, updatedAt: true } // No enviamos 'data' para que la lista sea ligera
    });
    res.json(circuits);
  } catch (error) {
    console.error('Error fetching circuits:', error);
    res.status(500).json({ error: 'Error al obtener los circuitos' });
  }
});

// GET /api/circuits/:id - Obtener un circuito específico
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const circuit = await prisma.circuit.findUnique({
      where: { id }
    });

    if (!circuit) {
      res.status(404).json({ error: 'Circuito no encontrado' });
      return;
    }

    if (circuit.userId !== userId) {
      res.status(403).json({ error: 'No tienes permiso para ver este circuito' });
      return;
    }

    res.json(circuit);
  } catch (error) {
    console.error('Error fetching circuit:', error);
    res.status(500).json({ error: 'Error al cargar el circuito' });
  }
});

// POST /api/circuits - Crear un nuevo circuito
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, data } = req.body;
    const userId = req.user!.id;

    if (!name || !data) {
      res.status(400).json({ error: 'Nombre y datos del circuito son obligatorios' });
      return;
    }

    const circuit = await prisma.circuit.create({
      data: {
        name,
        data: typeof data === 'string' ? data : JSON.stringify(data),
        userId,
      },
    });

    res.status(201).json(circuit);
  } catch (error) {
    console.error('Error creating circuit:', error);
    res.status(500).json({ error: 'Error al guardar el circuito' });
  }
});

// PUT /api/circuits/:id - Actualizar un circuito
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, data } = req.body;
    const userId = req.user!.id;

    // Verificar propiedad
    const existing = await prisma.circuit.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Circuito no encontrado' });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ error: 'No tienes permiso para modificar este circuito' });
      return;
    }

    const circuit = await prisma.circuit.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        data: data !== undefined ? (typeof data === 'string' ? data : JSON.stringify(data)) : existing.data,
      },
    });

    res.json(circuit);
  } catch (error) {
    console.error('Error updating circuit:', error);
    res.status(500).json({ error: 'Error al actualizar el circuito' });
  }
});

// DELETE /api/circuits/:id - Eliminar un circuito
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const existing = await prisma.circuit.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Circuito no encontrado' });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ error: 'No tienes permiso para eliminar este circuito' });
      return;
    }

    await prisma.circuit.delete({ where: { id } });
    res.json({ message: 'Circuito eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting circuit:', error);
    res.status(500).json({ error: 'Error al eliminar el circuito' });
  }
});

export default router;
