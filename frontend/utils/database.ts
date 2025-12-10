import * as SQLite from "expo-sqlite";
import { ScoringTemplate } from "@/types/database";
import { ValueConstant, base_results } from "@/types/counter";
import {
    defaultValues,
    defaultEnabledValues,
} from "@/constants/value_constants";

const db = SQLite.openDatabaseSync("twmj.db");

const EXPECTED_SCHEMA = {
    game_history: [
        { name: "name", type: "TEXT" },
        { name: "new_column", type: "INTEGER DEFAULT 0" },
    ],
};

function runMigrations() {
    try {
        // Iterate through each table in the expected schema
        for (const [tableName, expectedColumns] of Object.entries(
            EXPECTED_SCHEMA
        )) {
            // Check if table exists
            const tableExists = db.getFirstSync(
                `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
                [tableName]
            );

            if (!tableExists) {
                continue; // Skip if table doesn't exist yet
            }

            // Get current table info
            const currentColumns = db.getAllSync(
                `PRAGMA table_info(${tableName})`
            ) as any[];

            // Check for missing columns
            for (const expectedCol of expectedColumns) {
                const columnExists = currentColumns.some(
                    (col) => col.name === expectedCol.name
                );

                if (!columnExists) {
                    console.log(
                        `Adding column ${expectedCol.name} to ${tableName}`
                    );
                    db.execSync(
                        `ALTER TABLE ${tableName} ADD COLUMN ${expectedCol.name} ${expectedCol.type};`
                    );
                }
            }
        }
    } catch (error) {
        console.error("Error running migrations:", error);
    }
}

export function initDb() {
    db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scoring_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rules TEXT NOT NULL,
        rules_enabled TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_uri TEXT,
        detected_tiles TEXT NOT NULL,
        winner_seat INTEGER NOT NULL,
        current_wind TEXT NOT NULL,
        winning_tile TEXT,
        myself_mo INTEGER DEFAULT 0,
        door_clear INTEGER DEFAULT 0,
        template_id INTEGER NOT NULL,
        results TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES scoring_templates(id)
    );
  `);

    // Generic migration system: Add missing columns to existing tables
    runMigrations();

    const existingRules = db.getFirstSync(
        "SELECT COUNT(*) as count FROM scoring_templates"
    );
    if ((existingRules as any).count === 0) {
        saveScoringTemplate(
            "Default Rules",
            defaultValues,
            defaultEnabledValues,
            true
        );
    }
}

// Settings operations
export function saveSetting(key: string, value: string) {
    db.runSync("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [
        key,
        value,
    ]);
}

export function getSetting(key: string, defaultValue: string = "SET A NAME") {
    const result = db.getFirstSync("SELECT value FROM settings WHERE key = ?", [
        key,
    ]);
    return result ? (result as any).value : defaultValue;
}

// Scoring rules operations
export function saveScoringTemplate(
    name: string,
    rules: Record<ValueConstant["key"], number>,
    rulesEnabled: Record<ValueConstant["key"], boolean> = {} as Record<
        ValueConstant["key"],
        boolean
    >,
    isDefault: boolean = false
) {
    // If setting as default, unset other defaults first
    if (isDefault) {
        db.runSync("UPDATE scoring_templates SET is_default = 0");
    }

    const stmt = db.prepareSync(
        "INSERT INTO scoring_templates (name, rules, rules_enabled, is_default) VALUES (?, ?, ?, ?)"
    );
    stmt.executeSync([
        name,
        JSON.stringify(rules),
        JSON.stringify(rulesEnabled),
        isDefault ? 1 : 0,
    ]);
}

export function getAllScoringTemplates(): ScoringTemplate[] {
    const result = db.getAllSync(
        "SELECT * FROM scoring_templates ORDER BY is_default DESC, created_at DESC"
    );
    return result.map((row: any) => ({
        ...row,
        rules: JSON.parse(row.rules),
        rules_enabled: JSON.parse(row.rules_enabled || "{}"),
        is_default: row.is_default === 1,
    }));
}

export function getDefaultScoringTemplate(): ScoringTemplate | null {
    const result = db.getFirstSync(
        "SELECT * FROM scoring_templates WHERE is_default = 1"
    );
    if (result) {
        return {
            ...(result as any),
            rules: JSON.parse((result as any).rules),
            rules_enabled: JSON.parse((result as any).rules_enabled || "{}"),
            is_default: true,
        };
    }
    return null;
}

export function updateScoringTemplate(
    id: number,
    name: string,
    rules: Record<ValueConstant["key"], number>,
    rulesEnabled: Record<ValueConstant["key"], boolean>
) {
    db.runSync(
        "UPDATE scoring_templates SET name = ?, rules = ?, rules_enabled = ? WHERE id = ?",
        [name, JSON.stringify(rules), JSON.stringify(rulesEnabled), id]
    );
}

export function setDefaultScoringTemplate(id: number) {
    db.execSync(`
    UPDATE scoring_templates SET is_default = 0;
    UPDATE scoring_templates SET is_default = 1 WHERE id = ${id};
  `);
}

export function deleteScoringTemplate(id: number) {
    db.runSync("DELETE FROM scoring_templates WHERE id = ?", [id]);
}

export function getTemplateById(id: number): ScoringTemplate | null {
    const result = db.getFirstSync(
        "SELECT * FROM scoring_templates WHERE id = ?",
        [id]
    );
    if (result) {
        return {
            ...(result as any),
            rules: JSON.parse((result as any).rules),
            rules_enabled: JSON.parse((result as any).rules_enabled || "{}"),
            is_default: (result as any).is_default === 1,
        };
    }
    return null;
}

// Game history operations
export interface GameHistory {
    id: number;
    name: string | null;
    image_uri: string | null;
    detected_tiles: Record<string, number>;
    winner_seat: number;
    current_wind: string;
    winning_tile: string | null;
    myself_mo: boolean;
    door_clear: boolean;
    template_id: number;
    results: {
        value: number;
        log: string[];
    };
    created_at: string;
}

export function saveGameHistory(
    name: string | null,
    imageUri: string | null,
    detectedTiles: Record<string, number>,
    winnerSeat: number,
    currentWind: string,
    winningTile: string,
    myselfMo: boolean,
    doorClear: boolean,
    templateId: number,
    results: base_results
) {
    const stmt = db.prepareSync(
        `INSERT INTO game_history 
        (name, image_uri, detected_tiles, winner_seat, current_wind, winning_tile, myself_mo, door_clear, template_id, results) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.executeSync([
        name,
        imageUri,
        JSON.stringify(detectedTiles),
        winnerSeat,
        currentWind,
        winningTile,
        myselfMo ? 1 : 0,
        doorClear ? 1 : 0,
        templateId,
        JSON.stringify(results),
    ]);
}

export function getAllGameHistory(): GameHistory[] {
    const result = db.getAllSync(
        "SELECT * FROM game_history ORDER BY created_at DESC"
    );
    return result.map((row: any) => ({
        id: row.id,
        name: row.name,
        image_uri: row.image_uri,
        detected_tiles: JSON.parse(row.detected_tiles),
        winner_seat: row.winner_seat,
        current_wind: row.current_wind,
        winning_tile: row.winning_tile,
        myself_mo: row.myself_mo === 1,
        door_clear: row.door_clear === 1,
        template_id: row.template_id,
        results: JSON.parse(row.results),
        created_at: row.created_at,
    }));
}

export function getGameHistoryById(id: number): GameHistory | null {
    const result = db.getFirstSync("SELECT * FROM game_history WHERE id = ?", [
        id,
    ]);
    if (result) {
        const row = result as any;
        return {
            id: row.id,
            name: row.name,
            image_uri: row.image_uri,
            detected_tiles: JSON.parse(row.detected_tiles),
            winner_seat: row.winner_seat,
            current_wind: row.current_wind,
            winning_tile: row.winning_tile,
            myself_mo: row.myself_mo === 1,
            door_clear: row.door_clear === 1,
            template_id: row.template_id,
            results: JSON.parse(row.results),
            created_at: row.created_at,
        };
    }
    return null;
}

export function deleteGameHistory(id: number) {
    db.runSync("DELETE FROM game_history WHERE id = ?", [id]);
}

export function clearAllGameHistory() {
    db.runSync("DELETE FROM game_history");
}

//FOR TESTING ONLY PLEASE REMOVE WHEN DEPLOY
export function resetDatabase() {
    db.execSync(`
    DROP TABLE IF EXISTS settings;
    DROP TABLE IF EXISTS scoring_templates;
    DROP TABLE IF EXISTS game_history;
  `);
    initDb();
}
