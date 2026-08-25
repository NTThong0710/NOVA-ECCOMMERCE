import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";

/**
 * PaymentResultPage - Hien thi ket qua sau khi thanh toan VNPay.
 *
 * VNPay se redirect ve: /payment/result?vnp_ResponseCode=00&vnp_TxnRef=123&...
 * Trang nay doc cac query params va hien thi ket qua cho user.
 */

// Map ma loi VNPay sang tieng Viet
const VNPAY_RESPONSE_MESSAGES: Record<string, string> = {
  "00": "Giao dich thanh cong",
  "07": "Giao dich bi nghi ngo gian lan",
  "09": "The chua dang ky dich vu Internet Banking",
  "10": "Xac thuc sai qua 3 lan, the bi khoa",
  "11": "Giao dich het han, vui long thu lai",
  "12": "The bi khoa",
  "13": "Sai mat khau OTP. Vui long thu lai",
  "24": "Khach hang huy giao dich",
  "51": "Tai khoan khong du so du de thanh toan",
  "65": "Tai khoan vuot han muc giao dich trong ngay",
  "75": "Ngan hang dang bao tri",
  "79": "Nhap sai mat khau qua so lan quy dinh",
  "99": "Loi khong xac dinh",
};

type Status = "loading" | "success" | "failed";

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode");
    const txnRef = searchParams.get("vnp_TxnRef");
    const transactionNo = searchParams.get("vnp_TransactionNo");
    const amount = searchParams.get("vnp_Amount");

    setOrderId(txnRef);

    if (!responseCode) {
      // Khong co params -> co the vao trang nay truc tiep
      setStatus("failed");
      setMessage("Khong tim thay thong tin giao dich.");
      return;
    }

    if (responseCode === "00") {
      setStatus("success");
      setMessage(VNPAY_RESPONSE_MESSAGES["00"]);
      console.log("[VNPay] Thanh toan thanh cong:", { txnRef, transactionNo, amount });
    } else {
      setStatus("failed");
      setMessage(VNPAY_RESPONSE_MESSAGES[responseCode] || VNPAY_RESPONSE_MESSAGES["99"]);
      console.log("[VNPay] Thanh toan that bai, code:", responseCode);
    }
  }, [searchParams]);

  // Lay thong tin don hang tu sessionStorage (luu truoc khi redirect sang VNPay)
  const pendingOrderId = sessionStorage.getItem("pendingOrderId");
  const pendingTotal = sessionStorage.getItem("pendingOrderTotal");

  // Xoa session sau khi doc
  useEffect(() => {
    if (status !== "loading") {
      sessionStorage.removeItem("pendingOrderId");
      sessionStorage.removeItem("pendingOrderTotal");
      sessionStorage.removeItem("pendingOrderEmail");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-5xl text-blue-500 mb-4"></i>
          <p className="text-gray-500 text-lg">Dang kiem tra ket qua thanh toan...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="max-w-lg w-full text-center">
          {/* Icon thanh cong */}
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-2">Thanh toan thanh cong!</h1>
          <p className="text-gray-500 mb-6">{message}</p>

          {/* Chi tiet don hang */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold text-gray-700 mb-4">Chi tiet giao dich</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ma don hang</span>
                <span className="font-bold text-gray-800">#{orderId || pendingOrderId || "N/A"}</span>
              </div>
              {pendingTotal && (
                <div className="flex justify-between">
                  <span className="text-gray-500">So tien</span>
                  <span className="font-bold text-green-600">${Number(pendingTotal).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Phuong thuc</span>
                <span className="font-bold text-gray-800">VNPay</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trang thai</span>
                <span className="font-bold text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                  Da thanh toan
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              label="Tiep tuc mua sam"
              icon="pi pi-shopping-bag"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 border-none p-4 font-bold rounded-xl"
              onClick={() => navigate("/")}
            />
            <Button
              label="Xem lich su don hang"
              icon="pi pi-list"
              className="flex-1 p-button-outlined p-4 font-bold rounded-xl"
              onClick={() => navigate("/profile")}
            />
          </div>
        </div>
      </div>
    );
  }

  // status === "failed"
  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon that bai */}
        <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Thanh toan that bai</h1>
        <p className="text-gray-500 mb-6">{message}</p>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
          <p className="text-sm text-red-700">
            Don hang cua ban da bi huy. Ban co the thu lai hoac chon phuong thuc thanh toan khac.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">Ma don hang: #{orderId}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            label="Thu lai"
            icon="pi pi-refresh"
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 border-none p-4 font-bold rounded-xl"
            onClick={() => navigate("/checkout")}
          />
          <Button
            label="Ve trang chu"
            icon="pi pi-home"
            className="flex-1 p-button-outlined p-4 font-bold rounded-xl"
            onClick={() => navigate("/")}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
