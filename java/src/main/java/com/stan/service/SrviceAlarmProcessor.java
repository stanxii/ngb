package com.stan.service;

import hello.Application;

import java.io.IOException;
import java.util.Map;
import java.util.TimeZone;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;











import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.joda.time.DateTime;
import org.joda.time.LocalTime;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.support.atomic.RedisAtomicLong;;

////////////////////Eleastic Search guid
//curl -X PUT localhost:9200/products/product/1 -d '{
//	"id": "1",
//	"name" : "MacBook Air",
//	"price": 1099,
//	"descr" : "Some lengthy never-read description", 
//	"attributes" : {
//		"color" : "silver",
//		"display" : 13.3,
//		"ram" : 4
//	}
//}'
////////////////
//http://host:9200/products/product/_search
//{ "query" : { "term" : { "name": "MacBook Air" }}}
//{ "query" : { "prefix" : { "name": "Mac" }}}
//{ "query" : { "range" : { "price" : { "from" : 1000, "to": 2000 } } } }
//{ "from": 0, "size": 10, "query" : { "term" : { "name": "MacBook Air" }}}
//{ "sort" : { "name" :  { "order": "asc" } }, "query" : { "term" : { "name": "MacBook Air" }}}
//
//SAMPLE MAPPING
//
//{
//    "product": {
//        "properties": {
//            "ProductId":            { "type": "string", "index": "not_analyzed" },
//
//            "ProductEnabled":       { "type": "boolean" },
//            "PiecesIncluded":       { "type": "long" },
//            "LastModified":         { "type": "date", "format": "yyyy-MM-dd HH:mm:ss.SSS" },
//
//            "AvailableInventory":   { "type": "float" },
//            "Price":                { "type": "float" },
//
//            "LongDescription":      { "type": "string", "include_in_all" : true },
//            
//            "ProductName" : {
//                "type" : "multi_field",
//                "include_in_all" : true,
//                "fields" : {
//                    "ProductName":  { "type": "string", "index": "not_analyzed" },
//                    "lowercase":    { "type": "string", "analyzer": "lowercase_analyzer" },
//                    "suggest" :     { "type": "string", "analyzer": "suggest_analyzer" }
//                }
//            }
//        }
//    }
//}    

///Map to json use jackson lib
//publish to notify node.js a new RealTime alarm json msg
//Map<String, Object> json = new HashMap<String, Object>();
//json.put("user","kimchy");
//json.put("postDate",new Date());
//json.put("message","trying out Elastic Search");
// generate json
//String json = mapper.writeValueAsString(yourbeaninstance);
///////////////////////////////////////////////////////////////////

//jedis.publish("node.alarm.newalarm", alarmjson);
//ObjectMapper mapper = new ObjectMapper();
//template.convertAndSend("node.alarm.newalarm.*", mapper.writeValueAsString(alarmmap));

//IndexResponse response = client.prepareIndex("twitter", "tweet")
//.setSource(json)
//.execute()
//.actionGet();


public class SrviceAlarmProcessor {
		

	private Client client = null;
	/**
	 * 
	 */
	public SrviceAlarmProcessor() {
		super();
		// TODO Auto-generated constructor stub
		
		Client client = new TransportClient().addTransportAddress(new InetSocketTransportAddress("localhost", 9200));
	}
	
	protected void finalize() {
		client.close();
	}
	
	
	

	public void receiveMessage(String message, String channel) {
        System.out.println("Received <" + message + ">" + "Channel:<" + channel + "> + ");
        try {
			dowork(message, channel);
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
	
	private void dowork(String message, String channel) throws JsonParseException, JsonMappingException, IOException   {
		//ObjectMapper mapper = new ObjectMapper(); // create once, reuse  
        //String jsonSource = "{\"message\":\"Login succeeded!\",\"status\":0}";
		//Map<String, String> response = mapper.readValue(jsonSource, Map.class);
        
		//Json to Map
        ObjectMapper mapper = new ObjectMapper();      
        Map<String, Object> alarm = mapper.readValue(message, Map.class);
        System.out.println("now map alarm="+ alarm);
        
        String alarmcode =(String) alarm.get("alarmcode");

		int code = Integer.parseInt(alarmcode);
		if (code == 200002) {
			//NA
		} else if(code == 200940){
			savehfcalarm(message, alarm);
		} else {
			doalarm(alarm);			
			savelarm(message, alarm);
	
		}
    }
	
	
	private  void doalarm(Map<String, Object> alarm) {
		
		String alarmcode =(String) alarm.get("alarmcode");		
		int code = Integer.parseInt(alarmcode);
		
		switch (code) {
		case 200909: {
			try {
				doupgrade(alarm);
			} catch (JsonProcessingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
			break;
		}
		default:
		
			break;
		}
	}

	private  void savelarm(String alarmjson, Map<String, Object> alarmmap) throws JsonProcessingException {
	
		//save alarmentity to Alarm Search Engine index 
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(Application.class);
        StringRedisTemplate template = ctx.getBean(StringRedisTemplate.class);
        
		LocalTime currentTime = new LocalTime();
		System.out.println("The current local time is: " + currentTime);
		 //alarm lock to its belong 's EOc master mac address and show it in graph
		
		//Map to Json  Add ES index
		RedisAtomicLong alarmid_ra = new RedisAtomicLong("global:alarmid", template.getConnectionFactory(), 0);
		long alarmid = alarmid_ra.incrementAndGet();
		String salarmid = String.valueOf(alarmid);
		IndexResponse response = client.prepareIndex("alarms", "alarm", salarmid)
				.setSource(alarmjson)
				.execute()
				.actionGet();
		
		 
		//////////////////////////////////////////////////////////////////////////////////////// 
		//publish to notify node.js a new RealTime alarm json msg
//		 Map<String, Object> json = new HashMap<String, Object>();
//		 json.put("user","kimchy");
//		 json.put("postDate",new Date());
//		 json.put("message","trying out Elastic Search");
		// generate json
//		 String json = mapper.writeValueAsString(yourbeaninstance);
		 ///////////////////////////////////////////////////////////////////
		 
		//jedis.publish("node.alarm.newalarm", alarmjson);
		
		//realtime alarm
		 template.convertAndSend("node.alarm.newalarm.*", alarmjson);
		 
	}
	
	private  void savehfcalarm(String alarmjson, Map<String, Object> alarmmap) throws JsonProcessingException {
		
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(Application.class);
        StringRedisTemplate template = ctx.getBean(StringRedisTemplate.class);
		
		//System timezone
         TimeZone.setDefault(TimeZone.getTimeZone("Asia/Shanghai"));
		 DateTime datetime = DateTime.now();
		 System.out.println("The current DateTime time is: " + datetime.toString("E MM/dd/yyyy HH:mm:ss.SSS"));
		 //alarm lock to its belong 's EOc master mac address and show it in graph
		 
		//save alarmentity to Alarm Search Engine index 
		     	 
		 
		 
		//publish to notify node.js a new RealTime alarm json msg
		//jedis.publish("node.alarm.newalarm", alarmjson);
		 ObjectMapper mapper = new ObjectMapper();
		 template.convertAndSend("node.alarm.newalarm.*", mapper.writeValueAsString(alarmmap));
	
	}
	
	private  void doupgrade(Map<String, Object> alarm) throws JsonProcessingException {
				
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(Application.class);
        StringRedisTemplate template = ctx.getBean(StringRedisTemplate.class);
        

		
		String result = (String)alarm.get("alarmvalue");			
		String cbatmac = (String)alarm.get("mac");	
		String cbatid = template.opsForValue().get("mac:" +  cbatmac + ":deviceid");
		String cbatkey = "cbatid:" + cbatid + ":entity";						
        template.opsForHash().put(cbatkey, "upgrade", result);
        
		
		if(result.equalsIgnoreCase("0")){
			//��ɹ�
			//��հ汾��Ϣ			
			template.opsForHash().put("cbatid:"+cbatid+":cbatinfo", "appver", "");
			
		}
		if(!result.equalsIgnoreCase("1")){
			//����ͷ�˼�1			
			RedisAtomicLong num_update_t = new RedisAtomicLong("global:updated", template.getConnectionFactory(),0);
			num_update_t.incrementAndGet();
	
			System.out.println("now increantment global:updated ==" + num_update_t);
			
			
			String num = String.valueOf(num_update_t);
		
			//֪ͨǰ�˴�ͷ�������
			RedisAtomicLong totalra = new RedisAtomicLong("global:updatedtotal", template.getConnectionFactory(),0);
			long ltotal = totalra.get();			
			Map<String, String> json =ctx.getBean(Map.class); ;
			json.put("proc", num);
			json.put("total", String.valueOf(ltotal));
			ObjectMapper mapper = new ObjectMapper();
			
			
			//convert map to json string use write value as string
			template.convertAndSend("node.opt.updateproc.*", mapper.writeValueAsString(json));
		}		

		
	}
}
