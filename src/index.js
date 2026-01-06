import { AccessToken2, ServiceRtc, ServiceRtm, Role } from './AccessToken2.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const channelName = url.searchParams.get('channelName');
    const uid = url.searchParams.get('uid') || 0;
    const userUuid = url.searchParams.get('userUuid'); // Flexible Classroom 常用 Uuid

    const appId = env.AGORA_APP_ID;
    const appCertificate = env.AGORA_APP_CERTIFICATE;
    const expireTime = 3600; 
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expireTime;

    try {
      let responseData = {};

      // --- 邏輯 A: 產生 RTC Token (視訊用) ---
      if (channelName) {
        const rtcToken = new AccessToken2(appId, appCertificate, currentTimestamp, expireTime);
        const rtcService = new ServiceRtc(channelName, uid);
        rtcService.add_privilege(ServiceRtc.kPrivilegeJoinChannel, privilegeExpiredTs);
        rtcService.add_privilege(ServiceRtc.kPrivilegePublishAudioStream, privilegeExpiredTs);
        rtcService.add_privilege(ServiceRtc.kPrivilegePublishVideoStream, privilegeExpiredTs);
        rtcToken.add_service(rtcService);
        responseData.rtcToken = rtcToken.build();
      }

      // --- 邏輯 B: 產生 RTM Token (訊息/教具控制用) ---
      // RTM 通常使用 userUuid 作為標識
      if (userUuid) {
        const rtmToken = new AccessToken2(appId, appCertificate, currentTimestamp, expireTime);
        const rtmService = new ServiceRtm(userUuid);
        rtmService.add_privilege(ServiceRtm.kPrivilegeLogin, privilegeExpiredTs);
        rtmToken.add_service(rtmService);
        responseData.rtmToken = rtmToken.build();
      }

      if (!responseData.rtcToken && !responseData.rtmToken) {
        return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
      }

      return new Response(JSON.stringify(responseData), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
};
