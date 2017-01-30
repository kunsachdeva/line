import React, { Component } from 'react';
import {
  AppRegistry,Image,Animated,
  StyleSheet,PanResponder,
  Text,Dimensions,ToastAndroid,
  View,TouchableOpacity,TextInput
} from 'react-native';
import { Loop, Stage } from 'react-game-kit';
import { AdMobBanner, AdMobInterstitial, PublisherBanner} from 'react-native-admob'

const w=Dimensions.get('window').width;
const h=Dimensions.get('window').height;
var steps=5;
var flag=0;
var wall=0.3;
var speed=5;
const adHeight=50;
var _60ms=null;
var _1000ms=null;
var wallColor='#9bfffa';
var score=0;
var setting={
  difficulty:0.7
}
export default class line extends Component {
  constructor(props) {
    super(props);
    this.c=[];
    this.w=null;
    this.w_left =null;
    this.w_mid =null;
    this.w_right =null;
    this._cStyles=[];
    this._wStyle={style:{top:0}};
    for(var i=0;i<steps;i++)
      this._cStyles.push({
        style: {
          left:w/2
        }
      });
    var tail=[];
    for(var i=0;i<steps;i++)tail.push(w/2);
    this.state={lives:3,isPlaying:false,win:false,tail:tail,walls:[0.5,0.3],logoOpacity:new Animated.Value(0.5),textOpacity:new Animated.Value(0.9)};
  }
  componentWillMount(){
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder:function(e,g){return true},
      onMoveShouldSetPanResponder: function(e,g){return true},
      onPanResponderGrant: function(e){},
      onPanResponderMove: function(e,g){
        for(var i=0;i<steps-1;i++)
          this._cStyles[i].style.left=this._cStyles[i+1].style.left;
          if(g.x0<w/4)this._cStyles[steps-1].style.left-=(speed/2);
          else if(g.x0>w-w/4)this._cStyles[steps-1].style.left+=(speed/2);
          else this._cStyles[steps-1].style.left+=(g.x0>this._cStyles[steps-1].style.left)?(speed/2):-(speed/2);
        if(this._cStyles[steps-1].style.left>w)this._cStyles[steps-1].style.left=0;
        else if(this._cStyles[steps-1].style.left<0)this._cStyles[steps-1].style.left=w;
      }.bind(this),
      onPanResponderRelease: function(e,g){
        if(!this.state.isPlaying){
          Animated.timing(this.state.logoOpacity,{toValue:0,duration:1000}).start();
          Animated.timing(this.state.textOpacity,{toValue:0,duration:1000}).start();
          var tail=[];
          steps=5;
          speed=5;
          this.state.tail=[];
          while(this.c.length>5)this.c.pop();
          while(this._cStyles.length>5)this._cStyles.pop();
          for(var i=0;i<steps;i++)tail.push(w/2);
          this.state.tail=tail;
          this.state.isPlaying=true;
          this.state.lives=3;
          score=0;
          setting.difficulty=0.7;
          this._wStyle.style.top+=h;
          this.setState(this.state);
          this.startGame();
        }
      }.bind(this),
      onPanResponderTerminate: function(e){},
    });
  }
  moveWalls(){
    this._wStyle.style.top+=speed;
    if(this._wStyle.style.top>h){
      this._wStyle.style.backgroundColor=wallColor;
      this._wStyle.style.top=0;
      wall=Math.floor((Math.random() * 9) + 1)/10;
      if(score==50){setting.difficulty=0.9;this.setState(this.state)}
      if(score==25){setting.difficulty=0.8;this.setState(this.state)}
      this.w_left.setNativeProps({style:{width:w*wall}});
      this.w_right.setNativeProps({style:{width:w*(setting.difficulty-wall)}});
      this.score.setNativeProps({text:(++score).toString()});
    }
    var mouth={left:this._cStyles[steps-1].style.left,top:(h-((steps*10)+adHeight))};
    if((mouth.left<(w*wall)+5 || mouth.left>((w*((1-setting.difficulty)+wall))-5)) && mouth.top==this._wStyle.style.top+20){
      this._wStyle.style.backgroundColor='#ff2121';
      this.state.lives--;
      if(this.state.lives==0){
        this.stopGame();
        return;
      }
      this.setState(this.state);
    }
    else if(mouth.top==this._wStyle.style.top+20)
      this._wStyle.style.backgroundColor='#00ee00';
    this.w.setNativeProps(this._wStyle);
  }
  updateTail(){
    for(var i=0;i<steps;i++)
      this.c[i].setNativeProps(this._cStyles[i]);
  }
  elongateTail(){
    if((((steps*10)+adHeight))<h/2){
      steps++;
      if((steps*10)+adHeight+30>h){this.state.win=true;this.setState(this.state);}
      else{
        var naya=this._cStyles[this._cStyles.length-1].style.left;
        this.state.tail.push(naya);
        this.setState(this.state);
        this._cStyles.push({style:{left:naya}})
        if(steps==15)speed=10;
      }
    }
  }
  startGame(){
    _60ms=setInterval(function(){
        this.moveWalls();
        this.updateTail();
    }.bind(this),60)
    _1000ms=setInterval(function(){
      this.elongateTail();
    }.bind(this),10000)
  }
  stopGame(){
    AdMobInterstitial.requestAd(()=>AdMobInterstitial.showAd(()=>function(){alert(0)}));
    clearInterval(_60ms);
    clearInterval(_1000ms);
    Animated.timing(this.state.logoOpacity,{toValue:1,duration:1000}).start();
    Animated.timing(this.state.textOpacity,{toValue:1,duration:1000}).start((e)=>{
      this.state.isPlaying=false;
      this.setState(this.state);
    });
  }
  componentDidMount(){
    AdMobInterstitial.setTestDeviceID('EMULATOR');
    AdMobInterstitial.setAdUnitID('ca-app-pub-6552490392723191/4773718269');
    Animated.spring(this.state.logoOpacity,{toValue:1,friction:0,tension:100}).start();
  }
  render() {
    return (
      <View style={styles.container} {...this._panResponder.panHandlers}>
        <Text style={{color:'white',fontSize:15,fontStyle:'italic',position:'absolute',padding:20,right:0,zIndex:10}}>
          LIVES: <Text style={{fontSize:20}}>{this.state.lives+'\n'}</Text>
          SCORE: <TextInput ref={component => this.score = component} style={{fontSize:20}}/>
        </Text>
        <Animated.Image source={require('./img/logo.png')} style={{resizeMode:'contain',width:w*0.8,marginLeft:w*0.1,opacity:this.state.logoOpacity}}/>
        <Animated.Text style={{color:'white',fontSize:18,fontWeight:'bold',textAlign:'center',opacity:this.state.textOpacity}}>Tap anywhere to START</Animated.Text>
        <View ref={component => this.w = component} style={{flex:1,width:w,flexDirection:'row',position:'absolute',top:0,backgroundColor:wallColor}}>
          <View ref={component => this.w_left = component} style={{width:w*wall,height:10}}/>
          <View ref={component => this.w_mid = component} style={{width:w*(1-setting.difficulty),backgroundColor:'black',height:10}}/>
          <View ref={component => this.w_right = component} style={{width:w*(setting.difficulty-wall),height:10}}/>
        </View>
        {this.state.tail.map((p,i)=>{
              return(<View key={i} ref={component => this.c[i] = component} style={{backgroundColor:'rgb('+i*15+', 255, '+i*5+')',height:10,width:10,borderRadius:5,position:'absolute',bottom:(i*10+adHeight),left:p}}>
              </View>)
            })}
        <View style={{width:w,height:adHeight,position:'absolute',bottom:0,left:0}}>
        <AdMobBanner
            bannerSize="smartBannerPortrait"
            adUnitID="ca-app-pub-6552490392723191/3296985061"
            testDeviceID="EMULATOR"
          />   
        </View>
      </View>
    );
  }
}
var styles1 = StyleSheet.create({
  circle: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    position: 'absolute',
    left: 0,
    top: 0,backgroundColor:'pink'
  },
  container: {
    flex: 1,
    paddingTop: 64,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('line', () => line);
