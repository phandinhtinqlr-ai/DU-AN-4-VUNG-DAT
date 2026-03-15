import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Task, WorkLog, ActivityLog, Notification, SystemConfig, UserProfile } from '../types';

// Generic error handler as per guidelines
const handleFirestoreError = (error: any, operation: string, path: string) => {
  const errInfo = {
    error: error.message || String(error),
    operationType: operation,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    }
  };
  console.error(`Firestore Error [${operation}] at ${path}:`, JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export const firebaseService = {
  // Config
  async getConfig(): Promise<SystemConfig | null> {
    try {
      const docRef = doc(db, 'config', 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as SystemConfig;
      }
      // Return default config if not found
      return {
        departments: [],
        categories: [],
        lands: [],
        taskStatuses: [],
        priorities: [],
        riskLevels: []
      };
    } catch (e) {
      handleFirestoreError(e, 'get', 'config/main');
      return null;
    }
  },

  async updateConfig(config: SystemConfig) {
    try {
      await setDoc(doc(db, 'config', 'main'), config);
    } catch (e) {
      handleFirestoreError(e, 'write', 'config/main');
    }
  },

  // Users
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as UserProfile : null;
    } catch (e) {
      handleFirestoreError(e, 'get', `users/${uid}`);
      return null;
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (e) {
      handleFirestoreError(e, 'list', 'users');
      return [];
    }
  },

  async updateUserProfile(uid: string, updates: Partial<UserProfile>) {
    try {
      await updateDoc(doc(db, 'users', uid), updates);
    } catch (e) {
      handleFirestoreError(e, 'update', `users/${uid}`);
    }
  },

  async createUserProfile(profile: UserProfile) {
    try {
      await setDoc(doc(db, 'users', profile.uid), profile);
    } catch (e) {
      handleFirestoreError(e, 'create', `users/${profile.uid}`);
    }
  },

  async deleteUserProfile(uid: string) {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (e) {
      handleFirestoreError(e, 'delete', `users/${uid}`);
    }
  },

  // Tasks
  subscribeTasks(callback: (tasks: Task[]) => void) {
    const q = query(collection(db, 'tasks'), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (e) => handleFirestoreError(e, 'list', 'tasks'));
  },

  async createTask(task: Omit<Task, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...task,
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, 'create', 'tasks');
    }
  },

  async updateTask(id: string, updates: Partial<Task>) {
    try {
      await updateDoc(doc(db, 'tasks', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, 'update', `tasks/${id}`);
    }
  },

  // Activity Logs
  async logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    try {
      await addDoc(collection(db, 'activityLogs'), {
        ...log,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser?.uid
      });
    } catch (e) {
      handleFirestoreError(e, 'create', 'activityLogs');
    }
  },

  subscribeActivityLogs(callback: (logs: ActivityLog[]) => void) {
    const q = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog)));
    }, (e) => handleFirestoreError(e, 'list', 'activityLogs'));
  },

  // Notifications
  subscribeNotifications(userId: string, callback: (notifs: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    }, (e) => handleFirestoreError(e, 'list', 'notifications'));
  },

  async markNotificationRead(id: string) {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (e) {
      handleFirestoreError(e, 'update', `notifications/${id}`);
    }
  },

  // Work Logs
  subscribeWorkLogs(taskId: string | null, callback: (logs: WorkLog[]) => void) {
    let q = query(collection(db, 'workLogs'), orderBy('date', 'desc'));
    if (taskId) {
      q = query(collection(db, 'workLogs'), where('taskId', '==', taskId), orderBy('date', 'desc'));
    }
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkLog)));
    }, (e) => handleFirestoreError(e, 'list', 'workLogs'));
  },

  async addWorkLog(log: Omit<WorkLog, 'id'>) {
    try {
      await addDoc(collection(db, 'workLogs'), log);
    } catch (e) {
      handleFirestoreError(e, 'create', 'workLogs');
    }
  }
};
