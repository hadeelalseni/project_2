const SHA256 = require('crypto-js/sha256');
const level = require('level');

class Block{
    constructor(data){
        this.hash = "";
        this.height = 0;
        this.body = data;
        this.time = 0;
        this.previousBlockHash = "";
    }

}
class Blockchain{
    async addLevelDBData(key, value){
        this.db.put(key, value, function(err) {
            if (err) return console.log('Block ' + key + ' submission failed', err);});
    }
/*     async getLevelDBData(key){
        db.get(key, function(err, value) {
        if (err) return console.log('Not found!', err);
            console.log('Value = ' + value);});
    } */
    async addDataToLevelDB(value) {
        console.log("VALUE: "+ value);
        let i = 0;
        this.db.createReadStream().on('data', function(data) {
            i++;
        }).on('error', function(err) {
            return console.log('Unable to read data stream!', err)
            }).on('close', function() {
                console.log('Block #' + i);
                addLevelDBData(i, value);});
    }
    constructor(){
        this.db = level('./chainDB2');
        let i = 0;
        this.db.createReadStream().on('data', function(data){
            i++;
            console.log("Number of blocks in the DATABASE: "+i);
        });
        if (i == 0){
            console.log("G Block is bing created ! ");
            let gBlock = new Block("First Block NEW WAY");
            this.getBlockHeight().then(function(heightN){
                gBlock.height = heightN;
            });
            gBlock.time = new Date().getTime().toString().slice(0, -3);
            gBlock.previousBlockHash = "";
            gBlock.hash = SHA256(JSON.stringify(gBlock)).toString();
            console.log("G Block Height is : "+gBlock.height); 
            console.log("G Block Hash is : "+gBlock.hash); 
            console.log("G Block is : "+JSON.stringify(gBlock));  
            this.db.put(gBlock.height, JSON.stringify(gBlock).toString());
            console.log("another method to add block to db ");
            //this.addBlock(gBlock);
            //console.log("G Block is going to addBlock method ! ");  
            //this.addBlock(new Block().genesisBlock); 
        }

    }

    async addBlock(newBlock){
        console.log("new block is ::::::    "+ JSON.stringify(newBlock));

        let h = await this.getBlockHeight();

        await this.getBlockHeight().then(function(heightN){
            console.log("height of the second block: "+ heightN);
            newBlock.height = heightN;
        });
       
        console.log("h: "+ h);
        if(newBlock.height == 0){
            newBlock.previousBlockHash = "";
            console.log("in block h = 0 ");
        }else if (newBlock.height > 0){
            console.log("in block h > 0");
            let preBlock = await this.getBlock(newBlock.height - 1);
            console.log("PREBLOCK INFORMATION: "+ JSON.stringify(preBlock));
            newBlock.previousBlockHash = preBlock.hash;
            console.log("pre Block hash stored in the new block info : "+ newBlock.previousBlockHash);
            newBlock.time = new Date().getTime().toString().slice(0, -3);
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            console.log("new block information before stored in DB: "+ JSON.stringify(newBlock));


          //  this.db.put(newBlock.height, JSON.stringify(newBlock).toString());
            //this.addDataToLevelDB(newBlock.height, JSON.stringify(newBlock).toString());
            //this.addDataToLevelDB(newBlock.height);

            //if(this.validateBlock(newBlock.height)){
                this.addLevelDBData(newBlock.height, JSON.stringify(newBlock));

            //}
            

            console.log("new Block Added to DB");
            
            return newBlock;


        }
    } 
    async getBlockHeight() {
        return await new Promise((resolve,reject)=>{
          let i = 0;
          this.db.createReadStream().on('data', function(data) {
                i++;
              }).on('error', function(err) {
                  reject('Unable to read data stream!', err)
              }).on('end', function() {
                resolve(i)
              });
        })
      } 

     /* async getBlockHeight(){
        let i = 0;
        new Promise((resolve,reject)=>{
            console.log("in the promise");
            this.db.createReadStream().on('data', function(data){
                console.log("before i : "+ i);
                i++;
                console.log("after i : "+ i);
            }).on('error', function(err){
                    reject('Some error',err)
                }).on('end',function(){
                    i++;
                    resolve(i)
                });
        });
        console.log("in get height : "+ i);
        return i; 
    } */
 
getBlock(blockHeight){
    return this.db.get(blockHeight)
    .then(block => JSON.parse(block))
    .catch(err=>console.log('Can not get block',err))
  }
    /* getBlock(blockHeight){
        return this.db.get(blockHeight, function(err, value) {
        if (err) return console.log('Not found!', err);
        else return(value);
    });
    } */
    async validateBlock(blockHeight){
        let block = await this.getBlock(blockHeight);
        let blockHash = block.hash;
        block.hash = '';
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        if (blockHash === validBlockHash) {
            console.log("Valid Block #" + blockHeight);
            return true;
        } else {
            console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
            return false;
        }
    }
    async validateChain(){
        let errorLog = [];
        let wholechainleng = await this.getBlockHeight();
        for(let i = 0; i< wholechainleng-1; i++){
            if(!this.validateBlock(i))errorLog.push(i);
            let currBlock= await this.getBlock(i);
            let preBlock = await this.getBlock(i+1);
            let blockHash = currBlock.hash;
            let preBlockHash = preBlock.hash;
            if( blockHash !== preBlockHash){
                errorLog.push(i);
            }
        }
        if (errorLog.length > 0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: ' + errorLog);
        } else {
            console.log('No errors detected');
        }
    }
    
}



let xC = new Blockchain();
let x = new Block("Test");
let y = new Block("SECOND TEST");
let z = new Block(" Z TEST");

xC.addBlock(x);
xC.addBlock(y);





/* setTimeout(function(){
    let y = new Block("SECOND TEST");
    xC.addBlock(y).then(function(res){
        console.log("res: "+JSON.stringify(res));
    });

},10000); */
