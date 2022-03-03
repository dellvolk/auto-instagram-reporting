const __AIR = require('./script');

const args = process.argv

const usage = function () {
    const usageText = `
  Auto Insta Reporting helps you fastly report insta accounts

  usage:
    app <command>

    commands can be:

    login:      used to log in to instagram
    report:     used to report account          
  `

    // app report <url1> <url2>... ...<urlN>

    console.log(usageText)
};

(async () => {
    const AIR = await __AIR()


    switch (args[2]) {
        case 'login':
            const login = args[3]
            const password = args[4]
            if (!login || !password) {
                console.log('Usage: app login <login> <password>')
                await AIR.close()
                return;
            }

            const isLogin = await AIR.login(login, password)

            if (isLogin) {
                console.log('Login successfully!')
            } else {
                const text = `
                    Login failed!
                    
                    Try again or check error.png
                `
                console.log(text)
            }

            break
        case '-r':
        case 'report':
            if (!args[3]) {
                console.log('Usage: app report <url1> <url2>...<urlN>')
                break;
            }
            const isInit = await AIR.init()
            if (!isInit) return void 0;
            for (let i = 3; i < args.length; i++) {
                await AIR.reportPage(args[i])
            }
            break
        default:
            usage()
    }


    // console.log(AIR)

    // console.log({isInit})

    // // const r = await AIR.login()
    // // console.log({isLogin: r})

    await AIR.close()
})()
