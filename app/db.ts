import Database from 'better-sqlite3';

export const DATABASE = "db/chaos.db"

export type Event = {
  created_at: string,
  topic: string,
  value: string,
}

export function resetDB(db: Database.Database) {
  const resetScript = 
  `
    DROP TABLE IF EXISTS event_log;
    CREATE TABLE event_log (
        created_at TEXT NOT NULL,
        topic TEXT NOT NULL,
        value TEXT NOT NULL,
        UNIQUE(created_at, topic)
    );
  `
  console.log("Resetting Database");
  db.exec(resetScript);
  console.log("Complete");
}

export function insertEvent(db: Database.Database, event: Event) {
  const insert: Database.Statement =
    db.prepare(`INSERT INTO event_log (created_at, topic, value) VALUES (?, ?, ?)`);
  insert.run(event.created_at, event.topic, event.value);
}