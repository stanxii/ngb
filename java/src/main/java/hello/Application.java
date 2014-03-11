package hello;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

import com.stan.common.TrapReceiverBean;
import com.stan.service.ServiceHeartProcessor;
import com.stan.service.ServiceLogProcessor;
import com.stan.service.SrviceAlarmProcessor;

@Configuration
public class Application {
    @Bean
    JedisConnectionFactory connectionFactory() {
        return new JedisConnectionFactory();
    }
    
    @Bean
    RedisMessageListenerContainer container(final JedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer() {{
            setConnectionFactory(connectionFactory);
        }};
        container.addMessageListener(listenerAdapter(), new PatternTopic("chat"));
        //Service Alarm Processor Event Listenering
        container.addMessageListener(alarmServicelistenerAdapter(), new PatternTopic("servicealarm"));
        //Service Heart Processor Event Listenering
        container.addMessageListener(heartServicelistenerAdapter(), new PatternTopic("servicehearbert.*"));
        //Service Log Processor Event Listtening
        container.addMessageListener(logServicelistenerAdapter(), new PatternTopic("servicelog"));
        return container;
    }
    
    @Bean
    MessageListenerAdapter listenerAdapter() {
        return new MessageListenerAdapter(new Receiver(), "receiveMessage");
    }
    
    ///---------------------------------Service Message Listener Adapter  starter-------------------------/////
    @Bean
    MessageListenerAdapter alarmServicelistenerAdapter() {
        return new MessageListenerAdapter(new SrviceAlarmProcessor(), "receiveMessage");
    }
    
    @Bean
    MessageListenerAdapter heartServicelistenerAdapter() {
        return new MessageListenerAdapter(new ServiceHeartProcessor(), "receiveMessage");
    }
    @Bean
    MessageListenerAdapter logServicelistenerAdapter() {
        return new MessageListenerAdapter(new ServiceLogProcessor(), "receiveMessage");
    }
  ///---------------------------------Service Message Listener Adapter    ender-------------------------/////
    
    
    @Bean
    StringRedisTemplate template(JedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }
    
    public static void main(String[] args) throws InterruptedException {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(Application.class);
        StringRedisTemplate template = ctx.getBean(StringRedisTemplate.class);
        System.out.println("Sending message...");
        
        
        TrapReceiverBean traplistener = new TrapReceiverBean();
        traplistener.start();
        
        
        template.convertAndSend("chat", "Hello from Redis!");
        template.convertAndSend("servicealarm", "{\"alarmcode\":\"200290\"}");
        template.convertAndSend("servicehearbert.*", "{\"heartalarm\":\"8888888888\"}");
        
        ctx.close();
    }
}
