import { RequestMapping } from '../../index';
import { Api, ApiOperation, ApiImplicitParams, RequestParam, MultipartFile } from '../../index';
import { PostMapping } from '../../index';

@Api({ description: 'multipart控制器' })
@RequestMapping('/multipart')
export default class MultipartController {

  @ApiOperation({ value: '上传文件', notes: '上传证书文件' })
  @ApiImplicitParams([
    RequestParam({ value: 'file', desc: '证书', required: true, dataType: MultipartFile }),
    RequestParam({ value: 'desc', desc: '证书', required: true, paramType:'formData' }),
    RequestParam({ value: 'id', desc: '用户id', required: true })
  ])
  @PostMapping('/upload')
  upload(file: MultipartFile, desc, id) {
    return file.transferTo('app_data/images/' + file.name);
  }
}