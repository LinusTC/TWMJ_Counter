import { database, auth } from "@/FirebaseConfig";
import {
    ref,
    push,
    get,
    remove,
    set,
    serverTimestamp,
} from "firebase/database";

export interface ActiveGame {
    id: string;
    name: string;
    userId: string;
    createdAt: number;
    updatedAt: number;
}

// Create a new active game
export async function createActiveGame(name: string): Promise<string> {
    // Wait for authentication if not ready
    if (!auth.currentUser) {
        await new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                if (user) {
                    unsubscribe();
                    resolve(user);
                }
            });
        });
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const gamesRef = ref(database, `active_games/${userId}`);
    const newGameRef = push(gamesRef);

    await set(newGameRef, {
        name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return newGameRef.key!;
}

// Get all active games for the current user
export async function getAllActiveGames(): Promise<ActiveGame[]> {
    // Wait for authentication if not ready
    if (!auth.currentUser) {
        await new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                if (user) {
                    unsubscribe();
                    resolve(user);
                }
            });
        });
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
        return [];
    }

    const gamesRef = ref(database, `active_games/${userId}`);
    const snapshot = await get(gamesRef);

    if (!snapshot.exists()) {
        return [];
    }

    const games: ActiveGame[] = [];
    snapshot.forEach((childSnapshot) => {
        games.push({
            id: childSnapshot.key!,
            userId,
            ...childSnapshot.val(),
        });
    });

    // Sort by updatedAt descending
    return games.sort((a, b) => b.updatedAt - a.updatedAt);
}

// Delete an active game
export async function deleteActiveGame(gameId: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const gameRef = ref(database, `active_games/${userId}/${gameId}`);
    await remove(gameRef);
}
