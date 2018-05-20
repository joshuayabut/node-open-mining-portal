### Mac OS X Installation instructions

First of all you need Apple's Xcode and the Xcode Command Line Tools to be installed:

[https://itunes.apple.com/us/app/xcode](https://itunes.apple.com/us/app/xcode/id497799835?mt=12)

And Homebrew:

[http://brew.sh](http://brew.sh)


Than we need to install all the dependencies via brew:
```shell
brew tap discoteq/discoteq; brew install flock
brew install autoconf autogen automake
brew install gcc5
brew install binutils
brew install protobuf
brew install coreutils
brew install boost
brew install wget
brew install git
brew install redis
brew install nvm
brew install libsodium
```

Note nvm installation instructions which `brew install nvm` gives you. 
```shell
mkdir ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bash_profile
echo '  . "/usr/local/opt/nvm/nvm.sh"' >> ~/.bash_profile
source ~/.bash_profile
```

After that let's install Node.js 
```shell
nvm install v8.11.1
```

To be able to to build Z-NOMP we also need BSD/Linux-like `endian.h` to be in our Mac's `/usr/local/include/` directory
```shell
sudo curl https://raw.githubusercontent.com/igorvoltaic/z-nomp/master/endian-for-mac.h > /usr/local/include/endian.h
```

And we need our compiler to catch the exceptions as Linux does it. To do that edit `~/.node-gyp/8.11.1/include/node/common.gypi`. Find following and change it like this:
```shell
     ['OS=="mac"', {
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
          }
        }]
```

At this point we are ready to install Z-NOMP 
```shell
git clone https://github.com/z-classic/z-nomp
cd z-nomp
git checkout master
npm update
npm install
npm install stratum-pool
npm install bignum
```

and optionally
```shell
npm install pm2
```

to run Z-NOMP you need to have your daemon running and redis-server started:
```shell
zend --daemon
redis-server&
```

also check out `.json` cofig files before starting the server: 
```shell
coins/
pool_configs/
config_example.json
```

finally `npm start` (or optionally `pm2 start init.js`, check pm2 documentation for usage) 

That's it! Happy mining, folks!
