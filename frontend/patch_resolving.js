const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const regex = /\{resolvingMatch && \([\s\S]*?Disburse Prize & Finish\}[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;

code = code.replace(regex, `{resolvingMatch && (
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
            
            <p className="text-xs font-bold text-gray-600">Enter Standings for Joined Players</p>
            
            {playerStandings.length === 0 ? (
              <p className="text-xs text-textSecondary text-center py-4 bg-bgSurface rounded-xl">No players joined this match.</p>
            ) : (
              <div className="space-y-3">
                {playerStandings.map((p, idx) => (
                  <div key={idx} className="border border-borderColor rounded-xl p-4 bg-bgSurface shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-[#132040]">{p.name || 'Anonymous'}</span>
                      <span className="text-[10px] text-textSecondary font-mono">UID: {p.uid}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-textSecondary font-bold block mb-1 uppercase">Kills</label>
                        <input type="number" min="0" value={p.kills}
                          onChange={e => handleUpdateStanding(idx, 'kills', e.target.value)}
                          className="w-full border border-borderColor rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#042e5a]" />
                      </div>
                      <div>
                        <label className="text-[10px] text-textSecondary font-bold block mb-1 uppercase">Rank (1 = Winner)</label>
                        <input type="number" min="1" value={p.rank}
                          onChange={e => handleUpdateStanding(idx, 'rank', e.target.value)}
                          className="w-full border border-borderColor rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#042e5a]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleResolveSubmit} disabled={resolvingSubmitLoading}
              className="w-full bg-[#25D366] text-white font-black py-4 rounded-xl text-sm tracking-widest shadow-lg mt-6 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {resolvingSubmitLoading ? 'PROCESSING...' : 'DISBURSE PRIZE & FINISH'}
            </button>
          </div>
        </div>
      )}`);

fs.writeFileSync('src/app/page.tsx', code);
console.log('Successfully patched resolvingMatch modal!');
