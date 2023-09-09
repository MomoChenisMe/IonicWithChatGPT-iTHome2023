using AudioConvert.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xabe.FFmpeg;

namespace AudioConvert.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AudioConvertController : ControllerBase
    {
        [HttpPost("aac2m4a")]
        public async Task<ActionResult<AudioConvertOutPutModel>> Post([FromBody] AudioConvertModel base64AudioObject)
        {
            //Base64字串轉換成byte陣列
            var audioBytes = Convert.FromBase64String(base64AudioObject.aacBase64Data);
            //建立一個aac暫存檔案路徑，用於保存轉換後的資料
            var aacFilePath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + ".aac");
            //建立一個m4a暫存檔案路徑，用於保存轉換後的資料
            var m4aFilePath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + ".m4a");
            //轉換後的byte陣列寫入aac
            await System.IO.File.WriteAllBytesAsync(aacFilePath, audioBytes);
            //aac檔案轉換成m4a格式
            IConversion conversion = await FFmpeg.Conversions.FromSnippet.Convert(aacFilePath, m4aFilePath);
            IConversionResult result = await conversion.Start();
            //讀取轉換後的m4a檔案並轉換成byte陣列
            var m4aFileBytes = await System.IO.File.ReadAllBytesAsync(m4aFilePath);
            //byte陣列轉換成Base64字串
            var m4aFileBase64 = Convert.ToBase64String(m4aFileBytes);
            //清除暫存檔案
            System.IO.File.Delete(aacFilePath);
            System.IO.File.Delete(m4aFilePath);
            //建立回應物件
            AudioConvertOutPutModel response = new AudioConvertOutPutModel()
            {
                m4aBase64Data = m4aFileBase64
            };
            return Ok(response);
        }
    }
}
