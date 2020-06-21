import { RequestMapping } from '../../index';
import { Api, ApiOperation, ApiImplicitParams } from '../../index';
import { PostMapping } from '../../index';

@Api({ description: 'multipart控制器' })
@RequestMapping('/multipart')
export default class MultipartController {

  @ApiOperation({ value: '上传文件', notes: '上传证书文件' })
  @ApiImplicitParams([
    ({ name: 'files', value: '证书', required: true, dataType: 'file' }),
    ({ name: 'id', value: '用户id', required: true })
  ])
  @PostMapping('/upload')
  upload(req, resp) {

  }
}