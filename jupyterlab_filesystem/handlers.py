import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
from pyarrow import fs


def parsePath(path):
    parts = path.split('/', 1)
    bucket = parts[0] if len(parts) >= 1 else ''
    local_path = '/' + parts[1] if len(parts) > 1 else '/'
    return bucket, local_path


class BucketRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self, local_path):
        bucket, path = parsePath(local_path)
        print(bucket, path)
        fs_client = fs.LocalFileSystem()
        file_info_list = fs_client.get_file_info(
            fs.FileSelector(path, recursive=False))

        files = []
        dirs = []
        for info in file_info_list:
            if info.type.value == 2:
                # File type
                files.append({'name': info.base_name, 'ext': info.extension,
                              'size': info.size, 'mtime': info.mtime.isoformat()})
            elif info.type.value == 3:
                # Directory type
                dirs.append({'name': info.base_name,
                             'mtime': info.mtime.isoformat()})

        self.finish(json.dumps({'files': files, 'dirs': dirs}))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "jupyterlab_filesystem", "bucket")
    handlers = [("{}/(.*)".format(route_pattern), BucketRouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
