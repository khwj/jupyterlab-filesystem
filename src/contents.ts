import { PathExt } from '@jupyterlab/coreutils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { ModelDB } from '@jupyterlab/observables';
import { Contents, ServerConnection } from '@jupyterlab/services';
import { ISignal, Signal } from '@lumino/signaling';
import { requestAPI } from './handler';

interface FileInfo {
  name: string;
  ext: string;
  mtime: string;
  size: number;
}

interface DirInfo {
  name: string;
  mtime: string;
}

interface ListingResponse {
  files: FileInfo[];
  dirs: DirInfo[];
}

export interface FileSystemResource {
  bucket: string;
  path: string;
}

namespace Private {
  export const dummyDirectory: Contents.IModel = {
    type: 'directory',
    path: '',
    name: '',
    format: 'json',
    content: [],
    created: '',
    writable: false,
    last_modified: '',
    mimetype: ''
  };

  export function fileInfoToContents(
    path: string,
    file: FileInfo,
    getFileTypeForPath: (path: string) => DocumentRegistry.IFileType
  ): Contents.IModel {
    const fileType = getFileTypeForPath(path);
    return {
      name: file.name,
      path: PathExt.join(path, file.name),
      format: fileType.fileFormat,
      type: 'file',
      created: '',
      last_modified: file.mtime,
      mimetype: '',
      writable: false,
      content: null
    };
  }

  export function dirInfoToContents(
    path: string,
    dir: DirInfo
  ): Contents.IModel {
    return {
      name: dir.name,
      path: PathExt.join(path, dir.name),
      format: 'json',
      type: 'directory',
      created: '',
      last_modified: '',
      mimetype: '',
      writable: false,
      content: null
    };
  }
}

export class FileSystemDrive implements Contents.IDrive {
  modelDBFactory?: ModelDB.IFactory;

  _getFileTypeForPath: (path: string) => DocumentRegistry.IFileType;
  _serverSettings: ServerConnection.ISettings;
  _fileChanged = new Signal<this, Contents.IChangedArgs>(this);

  constructor(registry: DocumentRegistry) {
    this._serverSettings = ServerConnection.makeSettings();
    this._getFileTypeForPath = (path: string) => {
      const types = registry.getFileTypesForPath(path);
      return types.length === 0 ? registry.getFileType('text') : types[0];
    };
  }

  readonly serverSettings: ServerConnection.ISettings;

  get name(): string {
    return 'filesystem';
  }

  get fileChanged(): ISignal<this, Contents.IChangedArgs> {
    console.log('File changed', this._fileChanged);
    return this._fileChanged;
  }

  async get(
    localPath: string,
    options?: Contents.IFetchOptions
  ): Promise<Contents.IModel> {
    const apiBasePath = 'bucket';
    const bucket = 'local';
    const basePath = 'home/khwj';

    try {
      const resp = await requestAPI<ListingResponse>(
        PathExt.join(apiBasePath, bucket, basePath, localPath)
      );
      console.log(resp);
      const dirs = resp.dirs.map(f => Private.dirInfoToContents(localPath, f));
      const files = resp.files.map(f =>
        Private.fileInfoToContents(localPath, f, this._getFileTypeForPath)
      );

      const content: Contents.IModel = {
        name: PathExt.basename(localPath),
        path: PathExt.dirname(localPath),
        format: 'json',
        type: 'directory',
        created: '',
        last_modified: '',
        mimetype: '',
        writable: false,
        content: dirs.concat(files)
      };
      return content;
    } catch (e) {
      return Private.dummyDirectory;
    }
  }
  getDownloadUrl(localPath: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  newUntitled(options?: Contents.ICreateOptions): Promise<Contents.IModel> {
    throw new Error('Method not implemented.');
  }
  delete(localPath: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  rename(oldLocalPath: string, newLocalPath: string): Promise<Contents.IModel> {
    throw new Error('Method not implemented.');
  }
  save(
    localPath: string,
    options?: Partial<Contents.IModel>
  ): Promise<Contents.IModel> {
    throw new Error('Method not implemented.');
  }
  copy(localPath: string, toLocalDir: string): Promise<Contents.IModel> {
    throw new Error('Method not implemented.');
  }
  createCheckpoint(localPath: string): Promise<Contents.ICheckpointModel> {
    throw new Error('Method not implemented.');
  }
  listCheckpoints(localPath: string): Promise<Contents.ICheckpointModel[]> {
    throw new Error('Method not implemented.');
  }
  restoreCheckpoint(localPath: string, checkpointID: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteCheckpoint(localPath: string, checkpointID: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  isDisposed: boolean;
  dispose(): void {
    throw new Error('Method not implemented.');
  }
}
