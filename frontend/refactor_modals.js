const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

function replaceBetween(startStr, endStr, newContent) {
    const startIndex = code.indexOf(startStr);
    if (startIndex === -1) {
        console.error("Could not find start:", startStr.substring(0, 50));
        return;
    }
    const endIndex = code.indexOf(endStr, startIndex);
    if (endIndex === -1) {
        console.error("Could not find end:", endStr.substring(0, 50));
        return;
    }
    code = code.substring(0, startIndex) + newContent + code.substring(endIndex + endStr.length);
}

// 1. Profile Modal
replaceBetween(
    '{showProfileModal && (',
    '</form>\n          </div>\n        </div>\n      )}',
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

// 2. Password Modal
replaceBetween(
    '{showPasswordModal && (',
    '</form>\n          </div>\n        </div>\n      )}',
    `{showPasswordModal && (
        <div className="fixed inset-0 bg-bgSurface z-50 overflow-y-auto pb-24">
          <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 rounded-b-2xl shadow-md z-10 relative">
            <button onClick={() => setShowPasswordModal(false)} className="text-textPrimary">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-textPrimary font-bold text-base flex-1 text-center">Change Password</h2>
            <div className="w-6" />
          </div>
          <div className="p-4 mt-2">
            <form onSubmit={handleUserChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-textSecondary ml-1">Old Password</label>
                <input type="password" required value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#042e5a]" />
              </div>
              <div>
                <label className="text-xs font-bold text-textSecondary ml-1">New Password</label>
                <input type="password" required value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#042e5a]" />
              </div>
              <div className="pt-2 mt-4">
                <button type="submit" className="w-full py-4 font-black tracking-widest text-white bg-[#042e5a] rounded-xl shadow-lg active:scale-95 transition">UPDATE PASSWORD</button>
              </div>
            </form>
          </div>
        </div>
      )}`
);

// 3. Stats Modal
replaceBetween(
    '{showStatsModal && (',
    '</div>\n        </div>\n      )}',
    `{showStatsModal && (
        <div className="fixed inset-0 bg-[#f0f2f5] z-50 overflow-y-auto pb-24">
          <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 rounded-b-2xl shadow-md z-10 relative">
            <button onClick={() => setShowStatsModal(false)} className="text-textPrimary">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-textPrimary font-bold text-base flex-1 text-center">My Statistics</h2>
            <div className="w-6" />
          </div>
          <div className="p-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-100 shadow-sm">
                <p className="text-blue-900 font-black text-3xl">{user.stats?.matches || 0}</p>
                <p className="text-[10px] text-blue-700 font-bold uppercase mt-2">Matches Played</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center border border-green-100 shadow-sm">
                <p className="text-green-900 font-black text-3xl">{user.stats?.wins || 0}</p>
                <p className="text-[10px] text-green-700 font-bold uppercase mt-2">Matches Won</p>
              </div>
              <div className="bg-red-50 rounded-xl p-6 text-center border border-red-100 shadow-sm">
                <p className="text-red-900 font-black text-3xl">{user.stats?.kills || 0}</p>
                <p className="text-[10px] text-red-700 font-bold uppercase mt-2">Total Kills</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-6 text-center border border-yellow-100 shadow-sm">
                <p className="text-yellow-900 font-black text-3xl">₹{user.stats?.earned || 0}</p>
                <p className="text-[10px] text-yellow-700 font-bold uppercase mt-2">Total Earnings</p>
              </div>
            </div>
          </div>
        </div>
      )}`
);

// 4. Legal Modal
replaceBetween(
    '{legalModal && (',
    '</div>\n        </div>\n      )}',
    `{legalModal && (
        <div className="fixed inset-0 bg-[#f0f2f5] z-50 overflow-y-auto pb-24">
          <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 rounded-b-2xl shadow-md z-10 relative">
            <button onClick={() => setLegalModal(null)} className="text-textPrimary">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-textPrimary font-bold text-base flex-1 text-center">
              {legalModal === 'terms' ? 'Terms & Conditions' : legalModal === 'privacy' ? 'Privacy Policy' : 'About Us'}
            </h2>
            <div className="w-6" />
          </div>
          <div className="p-4 mt-2">
            <div className="bg-bgSurface rounded-2xl p-6 shadow-sm border border-borderColor text-sm text-gray-700 leading-relaxed min-h-[50vh]">
              {legalModal === 'terms' && (
                <p>Welcome to our App! By using this service, you agree to abide by our terms. All tournament entry fees are final. Prize pools are distributed automatically to your winning wallet. You are responsible for ensuring your Free Fire ID is entered correctly...</p>
              )}
              {legalModal === 'privacy' && (
                <p>Your privacy is important to us. We securely store your phone number and Free Fire UID to ensure seamless tournament registrations and prize distributions. We do not sell your personal data to third parties. For data deletion requests, contact our support.</p>
              )}
              {legalModal === 'about' && (
                <p>We are the ultimate Esports Tournament platform for Free Fire players! Join daily custom rooms, clash squads, and lone wolf matches to win real cash prizes based on your skills and kills.</p>
              )}
            </div>
          </div>
        </div>
      )}`
);

// 5. Deposit QR
replaceBetween(
    '{showDepositQR && (',
    '</motion.div>\n              </motion.div>\n            )}',
    `{showDepositQR && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-bgSurface z-50 overflow-y-auto pb-24">
                <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 rounded-b-2xl shadow-md z-10 relative">
                  <button onClick={() => setShowDepositQR(false)} className="text-textPrimary">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-textPrimary font-bold text-base flex-1 text-center">Scan & Pay</h2>
                  <div className="w-6" />
                </div>
                
                <div className="p-4 mt-6 text-center max-w-sm mx-auto">
                  <p className="text-textSecondary text-sm mb-4 font-bold">Pay ₹{depositAmt} via UPI</p>
                  <div className="bg-white p-4 rounded-xl border-2 border-[#f5c518] w-48 h-48 mx-auto mb-6 shadow-sm">
                    <img src={\`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=7017022966@ibl%26pn=FragArena%26am=\${depositAmt}%26cu=INR\`}
                      alt="UPI QR" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-sm text-textSecondary mb-6 font-semibold">Scan with GPay, PhonePe, Paytm</p>
                  <input type="text" placeholder="Enter UTR / Transaction ID" value={depositUtr}
                    onChange={e => setDepositUtr(e.target.value)}
                    className="w-full border border-borderColor rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#f5c518] mb-6 text-center text-textPrimary font-bold" />
                  
                  <button onClick={handleVerifyDeposit}
                    className="w-full py-4 bg-[#f5c518] text-[#132040] font-black rounded-xl text-sm tracking-widest shadow-lg hover:bg-yellow-400 transition active:scale-95">
                    SUBMIT UTR
                  </button>
                </div>
              </motion.div>
            )}`
);

// 6. Withdrawal Success
replaceBetween(
    '{successWithdrawal && (',
    '</motion.div>\n              </motion.div>\n            )}',
    `{successWithdrawal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-bgSurface z-50 overflow-y-auto pb-24">
                <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 rounded-b-2xl shadow-md z-10 relative">
                  <button onClick={() => setSuccessWithdrawal(null)} className="text-textPrimary">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-textPrimary font-bold text-base flex-1 text-center">Request Submitted</h2>
                  <div className="w-6" />
                </div>

                <div className="p-4 mt-6 max-w-sm mx-auto text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <h3 className="font-black text-xl text-[#132040]">Request Submitted!</h3>
                    <p className="text-textSecondary text-sm mt-2">Your withdrawal request has been registered.</p>
                  </div>

                  <div className="bg-bgPrimary rounded-xl p-5 border border-borderColor space-y-4 text-left shadow-sm">
                    <div>
                      <p className="text-textSecondary text-xs uppercase font-bold tracking-wider">Request ID</p>
                      <p className="text-textPrimary font-mono font-black text-base tracking-wider select-all mt-1">{successWithdrawal.txId}</p>
                    </div>
                    <div className="h-px bg-borderColor w-full my-2"></div>
                    <div>
                      <p className="text-textSecondary text-xs uppercase font-bold tracking-wider">Amount</p>
                      <p className="text-green-600 font-black text-2xl mt-1">₹{successWithdrawal.amount}</p>
                    </div>
                  </div>

                  <div className="text-xs text-yellow-700 font-bold bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-left leading-relaxed">
                    ⚠️ <b>Important Notice:</b> Copy your Request ID and send it to Customer Care on WhatsApp to get instant verification and approval!
                  </div>

                  <div className="pt-4">
                    <button onClick={() => {
                      navigator.clipboard.writeText(successWithdrawal.txId);
                      const textMsg = encodeURIComponent(\`Hello Admin, I have submitted a withdrawal request of ₹\${successWithdrawal.amount}. My Request ID is: \${successWithdrawal.txId}. Please approve it.\`);
                      window.open(\`https://api.whatsapp.com/send?phone=917017022966&text=\${textMsg}\`, '_blank');
                    }}
                      className="w-full bg-[#25D366] text-white font-black py-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[#128C7E] active:scale-95 transition tracking-widest">
                      SEND ID TO WHATSAPP
                    </button>
                  </div>
                </div>
              </motion.div>
            )}`
);

// 7. Admin Create Match
replaceBetween(
    '{showCreateMatch && (',
    '</form>\n            </motion.div>\n          </motion.div>\n        )}',
    `{showCreateMatch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bgSurface z-50 overflow-y-auto pb-24">
            <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 rounded-b-2xl shadow-md z-10 relative">
              <button onClick={() => setShowCreateMatch(false)} className="text-textPrimary">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-textPrimary font-bold text-base flex-1 text-center">Create New Match</h2>
              <div className="w-6" />
            </div>
            <div className="p-4 mt-2">
              <form onSubmit={handleCreateMatch} className="space-y-4">
                <input className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Match Title" value={newMatch.title} onChange={e => setNewMatch({...newMatch, title: e.target.value})} required />
                <select className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm" value={newMatch.category} onChange={e => setNewMatch({...newMatch, category: e.target.value})}>
                  {GAME_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input className="border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Date (YYYY-MM-DD)" value={newMatch.date} onChange={e => setNewMatch({...newMatch, date: e.target.value})} required />
                  <input className="border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Time (09:00 AM)" value={newMatch.time} onChange={e => setNewMatch({...newMatch, time: e.target.value})} required />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" className="border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Entry Fee" value={newMatch.entryFee} onChange={e => setNewMatch({...newMatch, entryFee: e.target.value})} required />
                  <input type="number" className="border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Prize Pool" value={newMatch.prizePool} onChange={e => setNewMatch({...newMatch, prizePool: e.target.value})} required />
                  <input type="number" className="border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Per Kill" value={newMatch.perKill} onChange={e => setNewMatch({...newMatch, perKill: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" className="border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Total Slots" value={newMatch.totalSlots} onChange={e => setNewMatch({...newMatch, totalSlots: e.target.value})} required />
                  <select className="border border-borderColor rounded-xl px-4 py-3 text-sm" value={newMatch.map} onChange={e => setNewMatch({...newMatch, map: e.target.value})}>
                    <option>Bermuda</option><option>Kalahari</option><option>Purgatory</option><option>Alpine</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <select className="border border-borderColor rounded-xl px-4 py-3 text-sm" value={newMatch.teamType} onChange={e => setNewMatch({...newMatch, teamType: e.target.value})}>
                    <option>Solo</option><option>Duo</option><option>Squad</option>
                  </select>
                  <select className="border border-borderColor rounded-xl px-4 py-3 text-sm" value={newMatch.mode} onChange={e => setNewMatch({...newMatch, mode: e.target.value})}>
                    <option>Solo</option><option>1v1</option><option>2v2</option><option>4v4</option>
                  </select>
                  <select className="border border-borderColor rounded-xl px-4 py-3 text-sm" value={newMatch.matchType} onChange={e => setNewMatch({...newMatch, matchType: e.target.value})}>
                    <option>Paid</option><option>Free</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-textSecondary mb-1 block">Prize Distribution</label>
                  <input className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm" value={newMatch.prizeDistribution} onChange={e => setNewMatch({...newMatch, prizeDistribution: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-textSecondary mb-1 block">Rules (one per line)</label>
                  <textarea rows={4} className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm resize-none" value={newMatch.rules} onChange={e => setNewMatch({...newMatch, rules: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-[#f5c518] text-[#132040] font-black py-4 rounded-xl text-sm tracking-widest shadow-lg mt-6">
                  CREATE MATCH
                </button>
              </form>
            </div>
          </motion.div>
        )}`
);

// 8. Admin Schedule Form
replaceBetween(
    '{showScheduleForm && (',
    '</form>\n              </div>\n            </div>\n          )}',
    `{showScheduleForm && (
            <div className="fixed inset-0 bg-[#f0f2f5] z-50 overflow-y-auto pb-24">
              <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 rounded-b-2xl shadow-md z-10 relative">
                <button onClick={() => setShowScheduleForm(false)} className="text-textPrimary">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-textPrimary font-bold text-base flex-1 text-center">
                  {editingSchedule ? 'Edit Schedule Slot' : 'Add Daily Schedule Slot'}
                </h2>
                <div className="w-6" />
              </div>
              <div className="p-4 mt-2">
                <form onSubmit={handleSaveSchedule} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-textSecondary font-bold block mb-1">Time Slot (e.g. 06:00 AM, 10:30 PM)</label>
                    <input type="text" value={schedTime} onChange={e => setSchedTime(e.target.value)}
                      className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#f5c518]" required />
                  </div>
                  <div>
                    <label className="text-[10px] text-textSecondary font-bold block mb-1">Category</label>
                    <select value={schedCategory} onChange={e => setSchedCategory(e.target.value)}
                      className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#f5c518]">
                      {GAME_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-textSecondary font-bold block mb-1">Match Title</label>
                    <input type="text" value={schedTitle} onChange={e => setSchedTitle(e.target.value)}
                      className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#f5c518]" required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-textSecondary font-bold block mb-1">Entry Fee (₹)</label>
                      <input type="number" value={schedEntryFee} onChange={e => setSchedEntryFee(e.target.value)}
                        className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#f5c518]" required />
                    </div>
                    <div>
                      <label className="text-[10px] text-textSecondary font-bold block mb-1">Prize Pool (₹)</label>
                      <input type="number" value={schedPrizePool} onChange={e => setSchedPrizePool(e.target.value)}
                        className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#f5c518]" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-textSecondary font-bold block mb-1">Per Kill (₹)</label>
                      <input type="number" value={schedPerKill} onChange={e => setSchedPerKill(e.target.value)}
                        className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#f5c518]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-textSecondary font-bold block mb-1">Total Slots</label>
                      <input type="number" value={schedTotalSlots} onChange={e => setSchedTotalSlots(e.target.value)}
                        className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#f5c518]" required />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-textSecondary font-bold block mb-1">Rules (one per line)</label>
                    <textarea rows={3} value={schedRules} onChange={e => setSchedRules(e.target.value)}
                      className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#f5c518] resize-none" placeholder="No emulator allowed..." />
                  </div>

                  <div>
                    <label className="text-[10px] text-textSecondary font-bold block mb-1">Announcement Notice (Optional)</label>
                    <input type="text" value={schedNotice} onChange={e => setSchedNotice(e.target.value)}
                      placeholder="e.g. Delayed by 10 mins or Map changes"
                      className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#f5c518]" />
                  </div>

                  <button type="submit"
                    className="w-full bg-[#042e5a] text-white font-black py-4 rounded-xl text-sm tracking-widest shadow-lg mt-6">
                    {editingSchedule ? 'UPDATE SCHEDULE' : 'SAVE SCHEDULE'}
                  </button>
                </form>
              </div>
            </div>
          )}`
);

// 9. Admin Resolving Match
replaceBetween(
    '{resolvingMatch && (',
    '</div>\n        </div>\n      )}',
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
replaceBetween(
    '{viewingPlayersMatch && (',
    '</div>\n        </div>\n      )}',
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
console.log('Successfully refactored all modals!');
