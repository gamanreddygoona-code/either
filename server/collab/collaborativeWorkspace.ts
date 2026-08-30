import crypto from 'crypto';

export interface UserPresence {
  userId: string;
  userName: string;
  color: string;
  cursor: { line: number; column: number };
  activeFile: string;
  lastSeen: number;
}

export interface DocumentDelta {
  docId: string;
  version: number;
  operation: 'insert' | 'delete' | 'retain';
  position: number;
  text?: string;
  length?: number;
  author: string;
  timestamp: number;
}

export interface CollabRoomState {
  roomId: string;
  docId: string;
  content: string;
  version: number;
  presence: Record<string, UserPresence>;
  history: DocumentDelta[];
}

/**
 * CRDT-Style Real-Time Collaborative Workspace Engine
 */
export class CollaborativeWorkspaceEngine {
  private static instance: CollaborativeWorkspaceEngine;
  private rooms: Map<string, CollabRoomState> = new Map();

  private constructor() {
    this.getOrCreateRoom('default-room', 'workspace-main.ts');
  }

  public static getInstance(): CollaborativeWorkspaceEngine {
    if (!CollaborativeWorkspaceEngine.instance) {
      CollaborativeWorkspaceEngine.instance = new CollaborativeWorkspaceEngine();
    }
    return CollaborativeWorkspaceEngine.instance;
  }

  public getOrCreateRoom(roomId: string, docId: string = 'main.ts'): CollabRoomState {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        roomId,
        docId,
        content: '// Either AI Collaborative Workspace\nexport const workspaceStatus = "live";\n',
        version: 1,
        presence: {},
        history: []
      };
      this.rooms.set(roomId, room);
    }
    return room;
  }

  public updatePresence(roomId: string, presence: UserPresence): CollabRoomState {
    const room = this.getOrCreateRoom(roomId);
    presence.lastSeen = Date.now();
    room.presence[presence.userId] = presence;
    return room;
  }

  public applyDelta(roomId: string, delta: Omit<DocumentDelta, 'version' | 'timestamp'>): CollabRoomState {
    const room = this.getOrCreateRoom(roomId);
    room.version += 1;

    const fullDelta: DocumentDelta = {
      ...delta,
      version: room.version,
      timestamp: Date.now()
    };

    if (delta.operation === 'insert' && delta.text) {
      room.content = room.content.slice(0, delta.position) + delta.text + room.content.slice(delta.position);
    } else if (delta.operation === 'delete' && delta.length) {
      room.content = room.content.slice(0, delta.position) + room.content.slice(delta.position + delta.length);
    }

    room.history.push(fullDelta);
    if (room.history.length > 200) room.history.shift();

    return room;
  }

  public getRoom(roomId: string): CollabRoomState | undefined {
    return this.rooms.get(roomId);
  }
}