import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getKakaoAuthorizeUrl } from "../api/inviteApi.jsx";

const InviteAccept = () => {
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const token = params.get("token");
      if (!token) {
        setError("초대 토큰이 없습니다.");
        setLoading(false);
        return;
      }
      try {
        const url = await getKakaoAuthorizeUrl(token);
        window.location.href = url;
      } catch (e) {
        setError("카카오 인증 URL을 가져오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params]);

  if (loading) return <div className="p-4">준비 중...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  return null;
};

export default InviteAccept;


