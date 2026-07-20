const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

function applyReplace(regex, replacement) {
    let prev = code;
    code = code.replace(regex, replacement);
    if (code === prev) {
        console.error("Failed to match regex:", regex);
    }
}

// 1. Profile Modal
applyReplace(
    /\{showProfileModal && \([\s\S]*?Edit Profile[\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*\)\}/,
    `{showProfileModal && (
        <div className="fixed inset-0 bg-bgSurface z-50 overflow-y-auto pb-24">
          <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 rounded-b-2xl shadow-md z-10 relative">
            <button onClick={() => setShowProfileModal(false)} className="text-textPrimary">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-textPrimary font-bold text-base flex-1 text-center">Edit Profile</h2>
            <div className="w-6" />
          </div>
          <div className="p-4 mt-2">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-textSecondary ml-1">Username</label>
                <input required value={profileForm.username} onChange={e => setProfileForm({...profileForm, username: e.target.value})} className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#042e5a]" />
              </div>
              <div>
                <label className="text-xs font-bold text-textSecondary ml-1">Phone Number</label>
                <input required value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#042e5a]" />
              </div>
              <div>
                <label className="text-xs font-bold text-textSecondary ml-1">Free Fire UID</label>
                <input value={profileForm.ffUid} onChange={e => setProfileForm({...profileForm, ffUid: e.target.value})} className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#042e5a]" />
              </div>
              <div>
                <label className="text-xs font-bold text-textSecondary ml-1">Free Fire Name</label>
                <input value={profileForm.ffName} onChange={e => setProfileForm({...profileForm, ffName: e.target.value})} className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#042e5a]" />
              </div>
              <div className="pt-2 mt-4">
                <button type="submit" className="w-full py-4 font-black tracking-widest text-white bg-[#042e5a] rounded-xl shadow-lg active:scale-95 transition">SAVE PROFILE</button>
              </div>
            </form>
          </div>
        </div>
      )}`
);

// 9. Admin Resolving Match
applyReplace(
    /\{resolvingMatch && \([\s\S]*?Submit Results[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*\)\}/,
    `{resolvingMatch && (
        <div className="fixed inset-0 bg-[#f0f2f5] z-50 overflow-y-auto pb-24">
          <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 rounded-b-2xl shadow-md z-10 relative">
            <button onClick={() => setResolvingMatch(null)} className="text-textPrimary">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-textPrimary font-bold text-base flex-1 text-center">Resolve Match</h2>
            <div className="w-6" />
          </div>
          <div className="p-4 mt-2 space-y-4">
            <div className="bg-bgPrimary p-4 rounded-xl border border-borderColor text-sm text-textPrimary mb-4 shadow-sm">
              <p>Match ID: <span className="font-bold">{resolvingMatch.matchId}</span></p>
              <p>Title: <span className="font-bold">{resolvingMatch.title}</span></p>
            </div>
            
            <h4 className="font-bold text-sm text-textSecondary mb-2 mt-4">Participant Results</h4>
            {resolvingMatch.joinedPlayers?.map((p: any, index: number) => (
              <div key={p._id || index} className="flex items-center gap-3 bg-bgSurface p-4 rounded-xl border border-borderColor shadow-sm">
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#132040]">{p.inGameName}</p>
                  <p className="text-[10px] text-textSecondary">UID: {p.inGameUid}</p>
                </div>
                <div className="w-20">
                  <label className="text-[10px] text-textSecondary font-bold block mb-1">Kills</label>
                  <input type="number" 
                    value={resolveResults[p.user?._id || p.user]?.kills || 0}
                    onChange={e => handleUpdateResult(p.user?._id || p.user, 'kills', Number(e.target.value))}
                    className="w-full border border-borderColor rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-[#f5c518] text-center" />
                </div>
                <div className="w-24">
                  <label className="text-[10px] text-textSecondary font-bold block mb-1">Win Amount</label>
                  <input type="number" 
                    value={resolveResults[p.user?._id || p.user]?.winAmount || 0}
                    onChange={e => handleUpdateResult(p.user?._id || p.user, 'winAmount', Number(e.target.value))}
                    className="w-full border border-borderColor rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-[#f5c518] text-center" />
                </div>
              </div>
            ))}

            <button onClick={handleSubmitResolve}
              className="w-full bg-[#25D366] text-white font-black py-4 rounded-xl text-sm tracking-widest shadow-lg mt-8 active:scale-95 transition">
              SUBMIT MATCH RESULTS
            </button>
          </div>
        </div>
      )}`
);

// 10. Admin Viewing Players
applyReplace(
    /\{viewingPlayersMatch && \([\s\S]*?Joined Players[\s\S]*?<\/div>\s*<\/div>\s*\)\}/,
    `{viewingPlayersMatch && (
        <div className="fixed inset-0 bg-[#f0f2f5] z-50 overflow-y-auto pb-24">
          <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 rounded-b-2xl shadow-md z-10 relative">
            <button onClick={() => setViewingPlayersMatch(null)} className="text-textPrimary">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-textPrimary font-bold text-base flex-1 text-center">Joined Players</h2>
            <div className="w-6" />
          </div>
          <div className="p-4 mt-2 space-y-3">
            {viewingPlayersMatch.joinedPlayers?.length === 0 ? (
              <p className="text-sm text-textSecondary text-center py-4 bg-bgSurface rounded-xl">No players joined yet.</p>
            ) : (
              viewingPlayersMatch.joinedPlayers?.map((p: any, idx: number) => (
                <div key={idx} className="bg-bgSurface p-4 rounded-xl border border-borderColor shadow-sm flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#132040]">{p.inGameName}</p>
                    <p className="text-xs text-textSecondary font-mono mt-0.5">UID: {p.inGameUid}</p>
                  </div>
                  {viewingPlayersMatch.teamType?.toLowerCase() === 'duo' && (
                     <div className="text-right">
                       <p className="text-[10px] text-textSecondary uppercase font-bold">Mate Name</p>
                       <p className="text-xs font-semibold text-textPrimary">{p.teammateName || '-'}</p>
                     </div>
                  )}
                  {viewingPlayersMatch.teamType?.toLowerCase() === 'squad' && (
                     <div className="text-right">
                       <p className="text-[10px] text-textSecondary uppercase font-bold">Squad Info</p>
                       <p className="text-xs font-semibold text-textPrimary">{p.squadDetails || '-'}</p>
                     </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}`
);

fs.writeFileSync('src/app/page.tsx', code);
console.log('Successfully applied remaining regex patches!');
