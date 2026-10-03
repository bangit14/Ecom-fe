import { useState } from "react";
import toast from "react-hot-toast";
import {
  ChatBubbleLeftRightIcon,
  StarIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const CHAT_CONVERSATIONS = [
  {
    id: 1,
    customerName: "Trần Minh Quân",
    lastMessage: "Shop ơi áo này size L 70kg mặc vừa không ạ?",
    time: "10:35",
    unread: true,
    messages: [
      { sender: "customer", text: "Shop ơi áo này size L 70kg mặc vừa không ạ?", time: "10:35" },
    ],
  },
  {
    id: 2,
    customerName: "Lê Thị Bích",
    lastMessage: "Đơn của mình bao giờ giao tới nơi vậy shop?",
    time: "09:12",
    unread: false,
    messages: [
      { sender: "customer", text: "Đơn của mình bao giờ giao tới nơi vậy shop?", time: "09:10" },
      { sender: "seller", text: "Chào bạn, đơn hàng của bạn bên mình đã bàn giao cho GHN rồi nhé ạ!", time: "09:12" },
    ],
  },
];

const REVIEWS = [
  {
    id: 101,
    productName: "Áo Thun Cotton Compact 100% Thoáng Mát",
    customerName: "Hoàng Tuấn",
    rating: 5,
    comment: "Áo mặc rất mát, chất vải mềm mịn, đường may kỹ càng. Sẽ ủng hộ shop tiếp!",
    date: "12/09/2026",
    reply: "Cảm ơn bạn Tuấn đã tin tưởng ủng hộ shop ạ ❤️",
  },
  {
    id: 102,
    productName: "Quần Jean Nam Slimfit Co Giãn",
    customerName: "Minh Trang",
    rating: 5,
    comment: "Giao hàng siêu nhanh, đóng gói cẩn thận 2 lớp, form quần chuẩn mẫu.",
    date: "11/09/2026",
    reply: "",
  },
];

export default function SellerCustomerCare() {
  const [activeTab, setActiveTab] = useState("CHAT"); // CHAT, REVIEWS, AUTO_REPLY
  const [conversations, setConversations] = useState(CHAT_CONVERSATIONS);
  const [activeChat, setActiveChat] = useState(conversations[0]);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [reviews, setReviews] = useState(REVIEWS);
  const [replyInput, setReplyInput] = useState({});
  const [autoReplySetting, setAutoReplySetting] = useState({
    enabled: true,
    welcomeMessage: "Cảm ơn bạn đã nhắn tin cho Shop! Chúng mình sẽ phản hồi ngay trong ít phút nhé ạ ❤️",
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = {
      sender: "seller",
      text: messageInput.trim(),
      time: "Vừa xong",
    };

    const updatedConvs = conversations.map((c) =>
      c.id === activeChat.id
        ? { ...c, lastMessage: newMsg.text, messages: [...c.messages, newMsg], unread: false }
        : c,
    );

    setConversations(updatedConvs);
    setActiveChat((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));
    setMessageInput("");
  };

  const handleSendReplyReview = (reviewId) => {
    const text = replyInput[reviewId];
    if (!text || !text.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, reply: text.trim() } : r)),
    );
    setReplyInput((prev) => ({ ...prev, [reviewId]: "" }));
    toast.success("Đã gửi phản hồi đánh giá cho khách hàng!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Chăm Sóc Khách Hàng
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Hộp thư chat trực tiếp với người mua và quản lý đánh giá/phản hồi sản phẩm
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 flex gap-2 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("CHAT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "CHAT" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
          <span>Hộp thư Chat khách hàng</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REVIEWS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "REVIEWS" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <StarIcon className="h-4 w-4" />
          <span>Quản lý Đánh giá & Review ({reviews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("AUTO_REPLY")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "AUTO_REPLY" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <SparklesIcon className="h-4 w-4" />
          <span>Tin nhắn trả lời tự động</span>
        </button>
      </div>

      {/* CHAT TAB */}
      {activeTab === "CHAT" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs grid grid-cols-1 md:grid-cols-12 min-h-[32rem] md:h-[calc(100dvh-14rem)] md:max-h-[48rem] overflow-hidden">
          {/* Conversation list */}
          <div className={`${showChatOnMobile ? "hidden" : "flex"} md:col-span-4 border-r border-gray-100 dark:border-gray-800 flex-col`}>
            <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 font-bold text-xs text-gray-700 dark:text-gray-300">
              Danh sách hội thoại ({conversations.length})
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto flex-1">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setActiveChat(c); setShowChatOnMobile(true); }}
                  className={`w-full text-left p-3.5 flex items-start gap-3 cursor-pointer transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 ${
                    activeChat?.id === c.id ? "bg-blue-50/70 dark:bg-blue-950/40" : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold flex items-center justify-center text-xs shrink-0">
                    {c.customerName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{c.customerName}</p>
                      <span className="text-xs text-gray-400">{c.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                  {c.unread && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Window */}
          <div className={`${showChatOnMobile ? "flex" : "hidden"} md:flex md:col-span-8 flex-col h-full bg-gray-50/30 dark:bg-gray-900/30`}>
            {activeChat ? (
              <>
                {/* Chat Topbar */}
                <div className="p-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button type="button" onClick={() => setShowChatOnMobile(false)} aria-label="Quay lại danh sách hội thoại" className="mr-1 inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 md:hidden"><ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /></button>
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {activeChat.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{activeChat.customerName}</p>
                      <p className="text-xs text-green-600 font-medium">Đang trực tuyến</p>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {activeChat.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${m.sender === "seller" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-md p-3 rounded-2xl text-sm ${
                          m.sender === "seller"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-2xs"
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 px-1">{m.time}</span>
                    </div>
                  ))}
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn trả lời khách hàng..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>Gửi</span>
                    <PaperAirplaneIcon className="h-3.5 w-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
                Chọn một cuộc trò chuyện để bắt đầu
              </div>
            )}
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === "REVIEWS" && (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{rev.customerName}</p>
                  <p className="text-xs text-gray-500">{rev.productName} • {rev.date}</p>
                </div>
                <div className="flex items-center text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-700 dark:text-gray-300">{rev.comment}</p>

              {rev.reply ? (
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs space-y-1">
                  <p className="font-bold text-blue-700 dark:text-blue-300">Phản hồi từ Người bán:</p>
                  <p className="text-gray-700 dark:text-gray-300">{rev.reply}</p>
                </div>
              ) : (
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập câu trả lời cảm ơn hoặc giải đáp..."
                    value={replyInput[rev.id] || ""}
                    onChange={(e) =>
                      setReplyInput((prev) => ({ ...prev, [rev.id]: e.target.value }))
                    }
                    className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendReplyReview(rev.id)}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
                  >
                    Gửi phản hồi
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AUTO REPLY SETTINGS */}
      {activeTab === "AUTO_REPLY" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-2xs space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Cấu hình câu trả lời tự động khi vắng mặt
          </h3>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs">
            <span className="font-semibold">Kích hoạt tin nhắn tự động</span>
            <input
              type="checkbox"
              checked={autoReplySetting.enabled}
              onChange={(e) => setAutoReplySetting((p) => ({ ...p, enabled: e.target.checked }))}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nội dung tin nhắn chào mừng:
            </label>
            <textarea
              rows={3}
              value={autoReplySetting.welcomeMessage}
              onChange={(e) => setAutoReplySetting((p) => ({ ...p, welcomeMessage: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            />
          </div>

          <button
            type="button"
            onClick={() => toast.success("Đã lưu cấu hình tin nhắn tự động!")}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
          >
            Lưu cài đặt
          </button>
        </div>
      )}
    </div>
  );
}
