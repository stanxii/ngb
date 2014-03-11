package com.stan.service;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;


public class ServiceLogProcessor {
	public void receiveMessage(String message, String channel) {
        System.out.println("Received <" + message + ">");
        try {
			dowork(message);
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
	
	private void dowork(String message) throws JsonParseException, JsonMappingException, IOException   {
		//ObjectMapper mapper = new ObjectMapper(); // create once, reuse  
        //String jsonSource = "{\"message\":\"Login succeeded!\",\"status\":0}";
		//Map<String, String> response = mapper.readValue(jsonSource, Map.class);
        
        ObjectMapper mapper = new ObjectMapper();
        Map<String, String> alarm = mapper.readValue(message, Map.class);
        //saveoptlog(alarm);
    }
	
	private  void saveoptlog(Map<String, String> json) {
		//presist alarm		
//		Jedis jedis=null;
//		try {
//		 jedis = redisUtil.getConnection();
//		
//		
//		}catch(Exception e){
//			redisUtil.getJedisPool().returnBrokenResource(jedis);
//			log.info("------>>>>>>>savelog ex1<<<<<<<<<----------");
//		}
//		
//		try{
//			//save alarm entity
//			Long logid = jedis.incr("global:optlogid");
//			String slogid = String.valueOf(logid);
//			
//			String logkey = "optlogid:" + slogid + ":entity";
//			json.put("logid", slogid);
//			if(json.containsKey("flag")){
//				Date date = new Date();
//				DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");			 			 
//				String logtimes = format.format(date);				
//				JSONObject newjson = new JSONObject();
//				newjson.put("time", logtimes);
//				newjson.put("user", json.get("user").toString());
//				String flag = json.get("flag").toString();
//				if(flag.equalsIgnoreCase("1")){
//					newjson.put("desc", "用户["+json.get("user").toString()+"]登入.");
//				}else if(flag.equalsIgnoreCase("2")){
//					newjson.put("desc", "用户["+json.get("user").toString()+"]注销.");
//				}else if(flag.equalsIgnoreCase("3")){
//					newjson.put("desc", "新用户["+json.get("user").toString()+"]注册,权限:只读用户.");
//				}
//				jedis.hmset(logkey, newjson);
//			}else{
//				jedis.hmset(logkey, json);
//			}
//
//			Double score = (double) System.currentTimeMillis();
//			jedis.zadd("opt_zcard", score, slogid);
//
//		}catch(Exception e){
//			e.printStackTrace();
//		}		
//		redisUtil.getJedisPool().returnResource(jedis);
//		
	}
	
}

