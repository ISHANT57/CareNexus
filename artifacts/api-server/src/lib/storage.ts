/**
 * StorageProvider abstraction layer.
 *
 * Currently implements LocalStorageProvider using the local `uploads/` directory.
 * Designed so a future cloud provider (S3, GCS, Azure Blob) can be swapped in
 * by implementing the StorageProvider interface without touching the route code.
 */
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = path.resolve(__dirname, "../../../uploads");

export interface SaveResult {
  /** The unique storage key (relative path within provider's root) */
  key: string;
  /** The publicly accessible URL path */
  url: string;
  /** Size of the saved file in bytes */
  sizeBytes: number;
}

export interface StorageProvider {
  save(buffer: Buffer, originalFilename: string, folder?: string): Promise<SaveResult>;
  getAbsolutePath(key: string): string;
  stream(key: string): Readable;
  delete(key: string): Promise<void>;
  exists(key: string): boolean;
}

/**
 * Local disk implementation.
 * Files are stored in: <project_root>/uploads/<folder>/<timestamp>-<randomHex>-<sanitisedOriginalName>
 */
export class LocalStorageProvider implements StorageProvider {
  private root: string;

  constructor(rootDir = UPLOADS_ROOT) {
    this.root = rootDir;
    this.ensureDir(rootDir);
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private sanitise(filename: string): string {
    return filename
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .toLowerCase()
      .slice(0, 100);
  }

  private generateKey(originalFilename: string, folder: string): string {
    const ext = path.extname(originalFilename);
    const base = path.basename(originalFilename, ext);
    const sanitisedBase = this.sanitise(base);
    const timestamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    return `${folder}/${timestamp}-${rand}-${sanitisedBase}${ext}`;
  }

  async save(buffer: Buffer, originalFilename: string, folder = "patients"): Promise<SaveResult> {
    const folderPath = path.join(this.root, folder);
    this.ensureDir(folderPath);

    const key = this.generateKey(originalFilename, folder);
    const absPath = path.join(this.root, key);

    await fs.promises.writeFile(absPath, buffer);

    return {
      key,
      url: `/uploads/${key}`,
      sizeBytes: buffer.length,
    };
  }

  getAbsolutePath(key: string): string {
    return path.join(this.root, key);
  }

  stream(key: string): Readable {
    const absPath = this.getAbsolutePath(key);
    if (!fs.existsSync(absPath)) {
      throw new Error(`File not found: ${key}`);
    }
    return fs.createReadStream(absPath);
  }

  async delete(key: string): Promise<void> {
    const absPath = this.getAbsolutePath(key);
    if (fs.existsSync(absPath)) {
      await fs.promises.unlink(absPath);
    }
  }

  exists(key: string): boolean {
    return fs.existsSync(this.getAbsolutePath(key));
  }
}

/** Singleton instance — import this across routes */
export const storage = new LocalStorageProvider();
