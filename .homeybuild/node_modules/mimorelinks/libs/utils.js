/**
 * 工具类
 */
const crypto = require('crypto');

module.exports = {

    isObject (obj) {
        return obj && Object.prototype.toString.apply(obj) === '[object Object]';
    },

    /**
     * 报文格式组装
     * 接口要求data字段需要单独做一次JSON.stringify
     * */
    messageFormat (msg) {
        try {
            let msgData = Object.assign({},msg);
            if (this.isObject(msgData.data)) {
                msgData.data = JSON.stringify(msgData.data);
            }
            return JSON.stringify(msgData);
        } catch (e) {
            console.error('[messageFormat] Bad msg!', msg);
            return '{}';
        }
    },

    /**
     * AES-CBC 128加密
     * 用户收到“heartbeat”里的16个字节的“token”字符串之后，对该字符串进行AES-CBC 128加密，
     * 生成16个字节的密文后，再转换为32个字节的ASCII码字符串。
     *
     * @param token 网关的token，随网关心跳包下发更新
     * @param password 网关加密密码，在米家APP获取
     * @param iv 初始化向量，米家约定，外部配置
     * */
    cipher (token, password, iv) {
        let cipher = crypto.createCipheriv('aes-128-cbc', password, iv);
        let key = cipher.update(token, "ascii", "hex");
        cipher.final('hex');
        return key;
    },

    // hsb2rgb([0, 1, 1]) => [255, 0, 0]
    hsb2rgb(hsb) {
        let rgb = [];
        //先令饱和度和亮度为100%，调节色相h
        for(let offset=240,i=0; i<3; i++,offset-=120) {
            //算出色相h的值和三个区域中心点(即0°，120°和240°)相差多少，然后根据坐标图按分段函数算出rgb。但因为色环展开后，红色区域的中心点是0°同时也是360°，不好算，索性将三个区域的中心点都向右平移到240°再计算比较方便
            let x=Math.abs((hsb[0]+offset)%360-240);
            //如果相差小于60°则为255
            if(x<=60) rgb[i]=255;
            //如果相差在60°和120°之间，
            else if(60<x && x<120) rgb[i]=((1-(x-60)/60)*255);
            //如果相差大于120°则为0
            else rgb[i]=0;
        }
        //再调节饱和度s
        for(let i=0;i<3;i++)
            rgb[i]+=(255-rgb[i])*(1-hsb[1]);
        //最后调节亮度b
        for(let i=0;i<3;i++)
            rgb[i]*=hsb[2];
        // 取整
        for(let i=0;i<3;i++)
            rgb[i]=Math.round(rgb[i]);
        return rgb;
    },

    // rgb2hsb([255, 0, 0]) => [0, 1, 1]
    rgb2hsb(rgb) {
        let hsb = [];
        let rearranged = rgb.slice(0);
        let maxIndex = 0,minIndex = 0;
        let tmp;
        //将rgb的值从小到大排列，存在rearranged数组里
        for(let i=0;i<2;i++) {
            for(let j=0;j<2-i;j++) {
                if (rearranged[j] > rearranged[j + 1]) {
                    tmp = rearranged[j + 1];
                    rearranged[j + 1] = rearranged[j];
                    rearranged[j] = tmp;
                }
            }
        }
        //rgb的下标分别为0、1、2，maxIndex和minIndex用于存储rgb中最大最小值的下标
        for(let i=0;i<3;i++) {
            if(rearranged[0]===rgb[i]) minIndex=i;
            if(rearranged[2]===rgb[i]) maxIndex=i;
        }
        //算出亮度
        hsb[2]=rearranged[2]/255.0;
        //算出饱和度
        hsb[1]=1-rearranged[0]/rearranged[2];
        //算出色相
        hsb[0]=maxIndex*120+60* (rearranged[1]/hsb[1]/rearranged[2]+(1-1/hsb[1])) *((maxIndex-minIndex+3)%3===1?1:-1);
        //防止色相为负值
        hsb[0]=(hsb[0]+360)%360;
        return hsb;
    },

    dec2hex(dec, len) {
        let hex = "";
        while(dec) {
            let last = dec & 15;
            hex = String.fromCharCode(((last>9)?55:48)+last) + hex;
            dec >>= 4;
        }
        if(len) {
            while(hex.length < len) hex = '0' + hex;
        }
        return hex;
    }
};