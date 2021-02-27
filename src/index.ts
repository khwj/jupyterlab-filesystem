import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { FileSystemBrowser } from './browser';
import { FileSystemDrive } from './contents';

const NAMESPACE = 'filesystem-browser';

/**
 * Initialization data for the jupyterlab-filesystem extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-filesystem:plugin',
  autoStart: true,
  requires: [IDocumentManager, IFileBrowserFactory, ILayoutRestorer],
  activate
};

function activate(
  app: JupyterFrontEnd,
  docManager: IDocumentManager,
  fileBrowserFactory: IFileBrowserFactory,
  restorer: ILayoutRestorer
) {
  let fileSystemBrowser: FileSystemBrowser;

  if (!fileSystemBrowser || fileSystemBrowser.isDisposed) {
    const drive = new FileSystemDrive(docManager.registry);
    docManager.services.contents.addDrive(drive);
    const browser = fileBrowserFactory.createFileBrowser(NAMESPACE, {
      driveName: drive.name,
      refreshInterval: 300000
    });
    fileSystemBrowser = new FileSystemBrowser(browser, drive);
    fileSystemBrowser.title.iconClass = 'jp-FileSystemIcon jp-SideBar-tabIcon';
    fileSystemBrowser.title.caption = 'Cloud Storage Browser';
    fileSystemBrowser.id = 'filesystem-browser';
  }

  if (!fileSystemBrowser.isAttached) {
    app.shell.add(fileSystemBrowser, 'left', { rank: 101 });
  }

  restorer.add(fileSystemBrowser, NAMESPACE);
}

export default extension;
