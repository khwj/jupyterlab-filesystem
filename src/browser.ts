import { FileBrowser } from '@jupyterlab/filebrowser';
import { PanelLayout, Widget } from '@lumino/widgets';
import { FileSystemDrive } from './contents';
import { parsePath } from './util';

export class FileSystemBrowser extends Widget {
  layout: PanelLayout;

  _browser: FileBrowser;
  _drive: FileSystemDrive;

  constructor(browser: FileBrowser, drive: FileSystemDrive) {
    super();

    this._browser = browser;
    this._drive = drive;
    this.addClass('jp-FileSystemBrowser')
    const layout = new PanelLayout();
    layout.addWidget(browser);
    this.layout = layout;

    this._browser.model.fileChanged.connect(this._onPathChange, this);
    this._onPathChange();
  }

  private _onPathChange(): void {
    const localPath = this._browser.model.manager.services.contents.localPath(
      this._browser.model.path
    );
    const { bucket, path } = parsePath(localPath);
    console.log('Path changed', localPath, bucket, path);
  }
}
