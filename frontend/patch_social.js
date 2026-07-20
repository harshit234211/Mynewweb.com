const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const regex = /<button onClick=\{\(\) => \{\s*const inviteText = encodeURIComponent[\s\S]*?INVITE VIA WHATSAPP\s*<\/button>/;

const replacement = `<div className="grid grid-cols-5 gap-3 relative z-10">
              <button onClick={() => {
                const inviteText = encodeURIComponent(\`Hey! Play Free Fire matches on FragArena & earn real cash! 🏆\\n\\nRegister using my Referral Code: \${user?.username} to get 10 Welcome Bonus Coins instantly!\\n\\nDownload/Join App here: \${window.location.origin}\`);
                window.open(\`https://api.whatsapp.com/send?text=\${inviteText}\`, '_blank');
              }} className="flex flex-col items-center justify-center gap-2 p-3 bg-[#25D366] text-white rounded-2xl shadow-lg active:scale-95 transition border border-[#1DA851]">
                <MessageCircle className="w-5 h-5" />
                <span className="text-[9px] font-black tracking-widest uppercase mt-1">WP</span>
              </button>

              <button onClick={() => {
                const inviteText = \`Hey! Play Free Fire matches on FragArena & earn real cash! 🏆\\n\\nRegister using my Referral Code: \${user?.username} to get 10 Welcome Bonus Coins instantly!\\n\\nDownload/Join App here: \${window.location.origin}\`;
                navigator.clipboard.writeText(inviteText);
                alert("Referral message copied! You can now paste it in Instagram DMs.");
              }} className="flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-2xl shadow-lg active:scale-95 transition">
                <Instagram className="w-5 h-5" />
                <span className="text-[9px] font-black tracking-widest uppercase mt-1">Insta</span>
              </button>

              <button onClick={() => {
                const inviteText = encodeURIComponent(\`Hey! Play Free Fire matches on FragArena & earn real cash! 🏆\\n\\nRegister using my Referral Code: \${user?.username} to get 10 Welcome Bonus Coins instantly!\`);
                window.open(\`https://twitter.com/intent/tweet?text=\${inviteText}&url=\${encodeURIComponent(window.location.origin)}\`, '_blank');
              }} className="flex flex-col items-center justify-center gap-2 p-3 bg-black text-white rounded-2xl shadow-lg border border-gray-700 active:scale-95 transition">
                <Twitter className="w-5 h-5" />
                <span className="text-[9px] font-black tracking-widest uppercase mt-1">X</span>
              </button>

              <button onClick={() => {
                const inviteText = encodeURIComponent(\`Hey! Play Free Fire matches on FragArena & earn real cash! 🏆\\n\\nRegister using my Referral Code: \${user?.username} to get 10 Welcome Bonus Coins instantly!\`);
                window.open(\`https://t.me/share/url?url=\${encodeURIComponent(window.location.origin)}&text=\${inviteText}\`, '_blank');
              }} className="flex flex-col items-center justify-center gap-2 p-3 bg-[#0088cc] text-white rounded-2xl shadow-lg active:scale-95 transition border border-[#006699]">
                <Send className="w-5 h-5" />
                <span className="text-[9px] font-black tracking-widest uppercase mt-1">TG</span>
              </button>

              <button onClick={() => {
                window.open(\`https://www.facebook.com/sharer/sharer.php?u=\${encodeURIComponent(window.location.origin)}\`, '_blank');
              }} className="flex flex-col items-center justify-center gap-2 p-3 bg-[#1877F2] text-white rounded-2xl shadow-lg active:scale-95 transition border border-[#155DBA]">
                <Facebook className="w-5 h-5" />
                <span className="text-[9px] font-black tracking-widest uppercase mt-1">FB</span>
              </button>
            </div>`;

if (!regex.test(code)) {
    console.log("Failed to find WhatsApp button. Checking if it's already a grid...");
} else {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/app/page.tsx', code);
    console.log("Successfully replaced WhatsApp button with social grid!");
}
