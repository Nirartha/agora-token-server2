import { AccessToken2, ServiceRtc, Role } from './AccessToken2.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const channelName = url.searchParams.get('channelName');
    const uid = url.searchParams.get('uid') || 0;

    if (!channelName) {
      return new Response(JSON.stringify({ error: "Missing channelName" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    try {
      const appId = env.AGORA_APP_ID;
      const appCertificate = env.AGORA_APP_CERTIFICATE;
      
      const expireTime = 3600; // 1 小時
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expireTime;

      // 1. 初始化 AccessToken2 (傳入 AppID, 憑證, 發行時間, 總過期時間)
      const token = new AccessToken2(appId, appCertificate, currentTimestamp, expireTime);
      
      // 2. 建立 RTC 服務
      const rtcService = new ServiceRtc(channelName, uid);
      
      // 3. 授予權限 (007 版本核心：加入頻道、發布音訊、發布視訊)
      rtcService.add_privilege(ServiceRtc.kPrivilegeJoinChannel, privilegeExpiredTs);
      rtcService.add_privilege(ServiceRtc.kPrivilegePublishAudioStream, privilegeExpiredTs);
      rtcService.add_privilege(ServiceRtc.kPrivilegePublishVideoStream, privilegeExpiredTs);
      
      token.add_service(rtcService);

      // 4. 生成 Token
      const tokenString = token.build();

      return new Response(JSON.stringify({ 
        token: tokenString, 
        channelName, 
        uid 
      }), {
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*" 
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};
