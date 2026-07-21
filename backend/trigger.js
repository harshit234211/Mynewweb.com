fetch('https://backend-jet-delta-82.vercel.app/api/admin/setup-templates')
  .then(res => res.text())
  .then(text => {
    console.log(text);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
