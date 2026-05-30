/* ===================================================
   チャットボット — FAQ 固定応答式
   =================================================== */

// FAQ データ定義（キーワード → 回答）
const FAQ_DATA = [
  {
    keywords: ['営業時間', '営業', '時間', '受付'],
    answer: '営業時間は平日 9:00〜18:00 です。\n土日・祝日はお休みをいただいております。',
  },
  {
    keywords: ['配送', '送料', '発送', '届く', '到着'],
    answer: '5,000円（税込）以上のご注文で送料無料です。\n通常 2〜3 営業日以内に発送いたします。',
  },
  {
    keywords: ['返品', '返金', '交換', 'キャンセル'],
    answer: '商品到着後 14 日以内であれば返品・交換を承ります。\n未使用・未開封のものに限ります。詳しくはお問い合わせフォームよりご連絡ください。',
  },
  {
    keywords: ['会社', '所在地', '住所', '場所', '本社'],
    answer: '【グリーンライフ株式会社】\n〒100-0001 東京都千代田区丸の内1-1-1\nTEL：03-1234-5678',
  },
  {
    keywords: ['商品', '製品', '一覧', 'ラインナップ', 'カタログ'],
    answer: '現在3つの商品シリーズをご用意しております。\n・ナチュラルクリーン\n・グリーンフレッシュ\n・エコデイリー\nページ上部の「商品紹介」からご確認いただけます。',
  },
  {
    keywords: ['価格', '値段', '料金', 'いくら', '費用'],
    answer: '商品価格は 980円〜3,980円（税込）の範囲でご用意しています。\n詳しくは商品紹介ページをご覧ください。',
  },
  {
    keywords: ['支払い', '決済', 'クレジット', 'PayPay', '支払方法'],
    answer: 'クレジットカード（VISA / Master / JCB）、銀行振込、コンビニ払いに対応しています。\nPayPayなどのQR決済は現在準備中です。',
  },
  {
    keywords: ['問い合わせ', '連絡', 'メール', '電話'],
    answer: 'お問い合わせはページ下部の「お問い合わせ」フォームよりお願いします。\n営業時間内であれば、通常 1 営業日以内にご返信いたします。',
  },
];

// ウェルカムメッセージ
const WELCOME_MESSAGE = 'こんにちは！グリーンライフのサポートBotです 🌿\nご質問があればお気軽にどうぞ。\nよくあるご質問のボタンもご利用ください。';

// クイック返信ボタンの定義
const QUICK_REPLIES = [
  '営業時間は？',
  '送料について',
  '返品・交換',
  '商品一覧',
];

// フォールバック回答
const FALLBACK_MESSAGE = 'お問い合わせありがとうございます。\nご質問の内容はページ下部の「お問い合わせフォーム」よりお送りいただくと、担当者より詳しくご回答いたします。';

/* ===================================================
   DOM 要素の取得
   =================================================== */
const chatbotToggle  = document.getElementById('chatbotToggle');
const chatbotWindow  = document.getElementById('chatbotWindow');
const chatbotClose   = document.getElementById('chatbotClose');
const chatMessages   = document.getElementById('chatMessages');
const chatInput      = document.getElementById('chatInput');
const chatSend       = document.getElementById('chatSend');
const chatbotBadge   = document.getElementById('chatbotBadge');
const quickReplies   = document.getElementById('quickReplies');

let isOpen = false;       // チャットウィンドウの開閉状態
let hasOpened = false;    // 一度でも開いたか

/* ===================================================
   チャットウィンドウの開閉
   =================================================== */
function toggleChat() {
  isOpen = !isOpen;
  chatbotWindow.classList.toggle('open', isOpen);
  chatbotToggle.classList.toggle('open', isOpen);

  if (isOpen) {
    // バッジを非表示
    chatbotBadge.style.display = 'none';
    // 初回起動時にウェルカムメッセージを表示
    if (!hasOpened) {
      hasOpened = true;
      setTimeout(() => {
        addBotMessage(WELCOME_MESSAGE);
        showQuickReplies();
      }, 300);
    }
    // インプットにフォーカス
    setTimeout(() => chatInput.focus(), 350);
  }
}

chatbotToggle.addEventListener('click', toggleChat);
chatbotClose.addEventListener('click', toggleChat);

/* ===================================================
   メッセージの追加
   =================================================== */

/**
 * ユーザーメッセージをチャットに追加する
 * @param {string} text - メッセージテキスト
 */
function addUserMessage(text) {
  const div = document.createElement('div');
  div.className = 'chat-message user';
  div.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
  chatMessages.appendChild(div);
  scrollToBottom();
}

/**
 * ボットメッセージをチャットに追加する
 * @param {string} text - メッセージテキスト（\n で改行可）
 */
function addBotMessage(text) {
  const div = document.createElement('div');
  div.className = 'chat-message bot';
  div.innerHTML = `
    <div class="chat-bubble">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
  `;
  chatMessages.appendChild(div);
  scrollToBottom();
}

/**
 * ボットが入力中のタイピングインジケーターを表示する
 * @returns {HTMLElement} タイピング要素
 */
function showTyping() {
  const div = document.createElement('div');
  div.className = 'chat-message bot typing-indicator';
  div.innerHTML = `
    <div class="chat-bubble" style="padding: 12px 16px; display: flex; gap: 4px; align-items: center;">
      <span style="width:7px;height:7px;background:var(--color-accent);border-radius:50%;animation:typingDot 1.2s infinite 0s;display:inline-block;"></span>
      <span style="width:7px;height:7px;background:var(--color-accent);border-radius:50%;animation:typingDot 1.2s infinite 0.4s;display:inline-block;"></span>
      <span style="width:7px;height:7px;background:var(--color-accent);border-radius:50%;animation:typingDot 1.2s infinite 0.8s;display:inline-block;"></span>
    </div>
  `;
  chatMessages.appendChild(div);
  scrollToBottom();
  return div;
}

/* タイピングドットのアニメーションをページに挿入 */
const typingStyle = document.createElement('style');
typingStyle.textContent = `
  @keyframes typingDot {
    0%, 60%, 100% { opacity: 0.2; transform: scale(0.8); }
    30% { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(typingStyle);

/* ===================================================
   クイック返信ボタン
   =================================================== */

/**
 * クイック返信ボタンを表示する
 */
function showQuickReplies() {
  quickReplies.innerHTML = '';
  QUICK_REPLIES.forEach((label) => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply-btn';
    btn.textContent = label;
    btn.addEventListener('click', () => {
      quickReplies.innerHTML = ''; // ボタンを消す
      handleUserInput(label);
    });
    quickReplies.appendChild(btn);
  });
}

/* ===================================================
   FAQ マッチング
   =================================================== */

/**
 * ユーザーの入力に対してFAQをキーワードマッチングし回答を返す
 * @param {string} input - ユーザーの入力テキスト
 * @returns {string} 回答テキスト
 */
function getFaqAnswer(input) {
  const normalized = input.replace(/\s+/g, '');
  for (const item of FAQ_DATA) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      return item.answer;
    }
  }
  return FALLBACK_MESSAGE;
}

/* ===================================================
   ユーザー入力の処理
   =================================================== */

/**
 * ユーザーのメッセージを処理してボットが応答する
 * @param {string} text - ユーザーの入力テキスト
 */
function handleUserInput(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  // ユーザーメッセージを追加
  addUserMessage(trimmed);

  // タイピングインジケーターを表示
  const typing = showTyping();

  // 疑似的な遅延で応答（自然な会話感）
  const delay = 600 + Math.random() * 600;
  setTimeout(() => {
    typing.remove();
    const answer = getFaqAnswer(trimmed);
    addBotMessage(answer);
    // 再度クイック返信を表示
    showQuickReplies();
  }, delay);
}

/* ===================================================
   送信イベント
   =================================================== */

// 送信ボタンクリック
chatSend.addEventListener('click', () => {
  const text = chatInput.value;
  chatInput.value = '';
  handleUserInput(text);
});

// Enterキーで送信（Shift+Enterは改行）
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const text = chatInput.value;
    chatInput.value = '';
    handleUserInput(text);
  }
});

/* ===================================================
   ユーティリティ
   =================================================== */

/**
 * チャットエリアを最下部にスクロールする
 */
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * XSS 対策: テキストをHTMLエスケープする
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープ済みテキスト
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ===================================================
   初期化: ページ読み込み後に通知バッジを表示
   =================================================== */
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!hasOpened) {
      chatbotBadge.style.display = 'flex';
    }
  }, 2000);
});
