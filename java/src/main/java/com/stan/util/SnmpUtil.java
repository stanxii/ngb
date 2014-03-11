package com.stan.util;

import java.io.IOException;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.Vector;

import org.snmp4j.CommunityTarget;
import org.snmp4j.PDU;
import org.snmp4j.Snmp;
import org.snmp4j.TransportMapping;
import org.snmp4j.event.ResponseEvent;
import org.snmp4j.mp.SnmpConstants;
import org.snmp4j.smi.Address;
import org.snmp4j.smi.Integer32;
import org.snmp4j.smi.IpAddress;
import org.snmp4j.smi.OID;
import org.snmp4j.smi.OctetString;
import org.snmp4j.smi.UdpAddress;
import org.snmp4j.smi.VariableBinding;
import org.snmp4j.transport.DefaultUdpTransportMapping;
import org.snmp4j.util.DefaultPDUFactory;
import org.snmp4j.util.TableEvent;
import org.snmp4j.util.TableUtils;

public class SnmpUtil {
	private Snmp snmp = null;
	private Address targetAddress = null;

	private TransportMapping transport = null;


	
	public enum Devicetye  {
		WEC_3501I_X7(1) , 
		WEC_3501I_E31(2),
		WEC_3501I_Q31(3),		
		WEC_3501I_C22(4),
		WEC_3501I_S220(5),
		WEC_3501I_S60(6),
		WEC_3702I(7),
		WEC_3703I(8),
		WEC_602(9),
		WEC_604(10),
		WEC_3801I(11);
		
		
		private final int value;
        public int getValue() {
            return value;
        }
		Devicetye(int value) {
            this.value = value;
        }
	}

	private Devicetye   devicetype ;
	
	// snmp ping judge device type when init devicetype
	public long eocping(String host, String port) {

		int bstatus = -1;
		int idevicetype;
		try {					
			idevicetype = getINT32PDU(host, port, new OID(new int[] {1,3,6,1,4,1,36186,8,4,8,0}));
			
			if(idevicetype >=1 && idevicetype <=24){
				bstatus =  idevicetype;
//				System.out
//				.println("Snmping "
//						+ host
//						+ " devtype="
//						+ devtype
//						+ "Snmpping Tong-- Snmpping Tong----------------------------------------");

			}else {
//				System.out.println("get response error");
//				System.out
//						.println("Snmping "
//								+ host
//								+ "XXXXX Bu Tong-- Bu Bu Bu Bu  Tong----------------------------");
				bstatus= -1;
			}
			
			
			

		} catch (IOException e) {

			// TODO Auto-generated catch block

			e.printStackTrace();
			
			bstatus= -1;

		}

		return (long)bstatus;

	}

	/**
	 * 
	 * 
	 * @param oid
	 *          
	 * @param type
	 *            int pdu
	 * @return String SNM
	 * @throws 
	 *      
	 * @throws IOException
	 */

	public static List<List> getTableData(String host, String port, String oid,
			int type) {

		List<List> table = new ArrayList<List>();
		List<String> row;
		//List<String> row = new ArrayList<String>();

		String cbatmac = "";
		String seth0 = "";
		
		
		boolean icnu = false;
		
		
		
		if(oid.equalsIgnoreCase(".1.3.6.1.4.1.36186.8.1")) icnu = true;

		try {


			Snmp snmp = new Snmp(new DefaultUdpTransportMapping());

			CommunityTarget target = new CommunityTarget();

			target.setCommunity(new OctetString("public"));// 

			target.setVersion(SnmpConstants.version2c);// 

			target.setAddress(new UdpAddress(host + "/" + port));

	

			target.setRetries(1); 

			target.setTimeout(6000); 

		
			snmp.listen();

			TableUtils tu = new TableUtils(snmp, new DefaultPDUFactory(type));
			
			

			OID[] columns = new OID[] { new VariableBinding(new OID(oid))
					.getOid() };

			List list = tu.getTable(target, columns, null, null);

	
			

			for (int i = 0; i < list.size(); i++) {
				TableEvent te = (TableEvent) list.get(i);
				VariableBinding[] vb = te.getColumns();
				if (vb == null || vb.length <= 0) {
					return null;
				}
				//System.out.println("cloums num=" + vb.length);
				
				

				for (int j = 0; j < vb.length; j++) {
					int oids[] = vb[j].getOid().getValue();

					String svalue = vb[j].getVariable().toString();

					int irow = 0;
					int icolum = 0;
					
					irow = oids[oids.length - 1] - 1;
					icolum = oids[oids.length - 2] - 1;	
					
				
					
					if( irow +1  > table.size()){
						
						row = new ArrayList<String>();
						table.add(row);
						
					}
					
					if(icolum + 1  > table.get(irow).size()){
						table.get(irow).add(svalue);	
					}
					
					//set value
					table.get(irow).set(icolum, svalue);
					

					//System.out.print("this value=[" + svalue  + "]   irow="+irow + "     icolum=" + icolum   + "\r\n");

				}
			}

			snmp.close();

		} catch (IOException e) {

			e.printStackTrace();
		}

		return table;
	
	}




	/**
	 * 
	 */
	private static List<Integer> item = new ArrayList<Integer>();

	/*
	 * 
	 */
	private static boolean checkNewLine(int value) {
		for (int i = 0; i < item.size(); i++) {
			if (item.get(i) == value) {
				item.clear();
				item.add(value);
				return true;
			}
		}
		item.add(value);
		return false;
	}

	/* SNMP V2 SET PDU */
	public boolean setV2PDU(String host, String port, OID oid, Integer32 value) {
		// /////////////////////////////////////

		boolean bstatus = false;
		try {

			Snmp snmp = new Snmp(new DefaultUdpTransportMapping());

			CommunityTarget target = new CommunityTarget();

			target.setCommunity(new OctetString("private"));

			target.setVersion(SnmpConstants.version2c);

			target.setAddress(new UdpAddress(host + "/" + port));


			target.setRetries(1); 

			target.setTimeout(3000); 

			PDU response = null;// 

			PDU request = new PDU();
			request.add(new VariableBinding(oid, value));
			request.setType(PDU.SET);

			snmp.listen(); 

			ResponseEvent responseEvent = snmp.send(request, target); 
			if (response != null) {
				if (response.getErrorIndex() == response.noError
						&& response.getErrorStatus() == response.noError) {
					bstatus = true;
				}

			}

			snmp.close();
		} catch (IOException e) {

			// TODO Auto-generated catch block

			e.printStackTrace();

		}

		return bstatus;

	}
	
	public boolean sethfcPDU(String host, String port, OID oid, Integer32 value,String community) {
		// /////////////////////////////////////

		boolean bstatus = false;
		try {

			Snmp snmp = new Snmp(new DefaultUdpTransportMapping());

			CommunityTarget target = new CommunityTarget();

			target.setCommunity(new OctetString(community));

			target.setVersion(SnmpConstants.version1);

			target.setAddress(new UdpAddress(host + "/" + port));


			target.setRetries(1); 

			target.setTimeout(3000); 

			PDU response = null;// 

			PDU request = new PDU();
			request.add(new VariableBinding(oid, value));
			request.setType(PDU.SET);

			snmp.listen(); 

			ResponseEvent responseEvent = snmp.send(request, target); 
			if (response != null) {
				if (response.getErrorIndex() == response.noError
						&& response.getErrorStatus() == response.noError) {
					bstatus = true;
				}

			}

			snmp.close();
		} catch (IOException e) {

			// TODO Auto-generated catch block

			e.printStackTrace();

		}

		return bstatus;

	}

	////
	/* SNMP V2 SET PDU */
	public boolean setV2StrPDU(String host, String port, OID oid, String value) {
		// /////////////////////////////////////

		boolean bstatus = false;
		try {

			Snmp snmp = new Snmp(new DefaultUdpTransportMapping());

			CommunityTarget target = new CommunityTarget();

			target.setCommunity(new OctetString("private"));

			target.setVersion(SnmpConstants.version2c);

			target.setAddress(new UdpAddress(host + "/" + port));


			target.setRetries(1); 

			target.setTimeout(3000); 

			PDU response = null;// 

			PDU request = new PDU();
			request.add(new VariableBinding(oid, new OctetString(value)));
			request.setType(PDU.SET);

			snmp.listen(); 

			ResponseEvent responseEvent = snmp.send(request, target); 
			if (response != null) {
				if (response.getErrorIndex() == response.noError
						&& response.getErrorStatus() == response.noError) {
					bstatus = true;
				}

			}

			snmp.close();
		} catch (IOException e) {

			// TODO Auto-generated catch block

			e.printStackTrace();

		}

		return bstatus;

	}
	
	public boolean sethfcStrPDU(String host, String port, OID oid, String value,String community) {
		// /////////////////////////////////////

		boolean bstatus = false;
		try {

			Snmp snmp = new Snmp(new DefaultUdpTransportMapping());

			CommunityTarget target = new CommunityTarget();

			target.setCommunity(new OctetString(community));

			target.setVersion(SnmpConstants.version1);

			target.setAddress(new UdpAddress(host + "/" + port));


			target.setRetries(1); 

			target.setTimeout(3000); 

			PDU response = null;// 

			PDU request = new PDU();
			request.add(new VariableBinding(oid, new OctetString(value)));
			request.setType(PDU.SET);

			snmp.listen(); 

			ResponseEvent responseEvent = snmp.send(request, target); 
			if (response != null) {
				if (response.getErrorIndex() == response.noError
						&& response.getErrorStatus() == response.noError) {
					bstatus = true;
				}

			}

			snmp.close();
		} catch (IOException e) {

			// TODO Auto-generated catch block

			e.printStackTrace();

		}

		return bstatus;

	}

	public boolean sethfcIpPDU(String host, String port, OID oid, InetAddress value,String community) {
		// /////////////////////////////////////

		boolean bstatus = false;
		try {

			Snmp snmp = new Snmp(new DefaultUdpTransportMapping());

			CommunityTarget target = new CommunityTarget();

			target.setCommunity(new OctetString(community));

			target.setVersion(SnmpConstants.version1);

			target.setAddress(new UdpAddress(host + "/" + port));


			target.setRetries(1); 

			target.setTimeout(3000); 

			PDU response = null;// 

			PDU request = new PDU();
			request.add(new VariableBinding(oid, new IpAddress(value)));
			request.setType(PDU.SET);

			snmp.listen(); 

			ResponseEvent responseEvent = snmp.send(request, target); 
			if (response != null) {
				if (response.getErrorIndex() == response.noError
						&& response.getErrorStatus() == response.noError) {
					bstatus = true;
				}

			}

			snmp.close();
		} catch (IOException e) {

			// TODO Auto-generated catch block

			e.printStackTrace();

		}

		return bstatus;

	}

	// /////////////////

	public String getStrPDU(String host, String port, OID oid)
			throws IOException {
		String result = "";
		try {

			Snmp snmp = new Snmp(new DefaultUdpTransportMapping());

			CommunityTarget target = new CommunityTarget();

			target.setCommunity(new OctetString("public"));

			target.setVersion(SnmpConstants.version2c);

			target.setAddress(new UdpAddress(host + "/" + port));



			target.setRetries(1); 

			target.setTimeout(3000); 

			snmp.listen(); 

			PDU request = new PDU(); 

			// set pud type and set oid

			request.setType(PDU.GET);

			// device type
			request.add(new VariableBinding(oid));

			// System.out.println("request UDP:" + request);

			PDU response = null;// 

			ResponseEvent responseEvent = snmp.send(request, target); 
																		


			response = responseEvent.getResponse();

			// response PDU

			if (response != null) {

				if (response.getErrorIndex() == response.noError
						&& response.getErrorStatus() == response.noError) {

					VariableBinding recVB = (VariableBinding) response
							.getVariableBindings().elementAt(0);

					result = recVB.getVariable().toString();

				}
			}

			snmp.close();

		} catch (IOException e) {

			// TODO Auto-generated catch block

			e.printStackTrace();

		}

		return result;

	}

	public String gethfcStrPDU(String host, String port, OID oid,String community)
	throws IOException {
	String result = "";
	try {
	
		Snmp snmp = new Snmp(new DefaultUdpTransportMapping());
	
		CommunityTarget target = new CommunityTarget();
	
		target.setCommunity(new OctetString(community));
	
		target.setVersion(SnmpConstants.version1);
	
		target.setAddress(new UdpAddress(host + "/" + port));
	
	
	
		target.setRetries(1); 
	
		target.setTimeout(3000); 
	
		snmp.listen(); 
	
		PDU request = new PDU(); 
	
		// set pud type and set oid
	
		request.setType(PDU.GET);
	
		// device type
		request.add(new VariableBinding(oid));
	
		// System.out.println("request UDP:" + request);
	
		PDU response = null;// 
	
		ResponseEvent responseEvent = snmp.send(request, target); 
																	
	
	
		response = responseEvent.getResponse();
	
		// response PDU
	
		if (response != null) {
	
			if (response.getErrorIndex() == response.noError
					&& response.getErrorStatus() == response.noError) {
	
				VariableBinding recVB = (VariableBinding) response
						.getVariableBindings().elementAt(0);
	
				result = recVB.getVariable().toString();
	
			}
		}
	
		snmp.close();
	
	} catch (IOException e) {
	
		// TODO Auto-generated catch block
	
		e.printStackTrace();
	
	}
	
	return result;
	
	}
	
	public int getINT32PDU(String host, String port, OID oid)
			throws IOException {
		int result = -1;
		try {

			Snmp snmp = new Snmp(new DefaultUdpTransportMapping());

			CommunityTarget target = new CommunityTarget();

			target.setCommunity(new OctetString("public"));// 

			target.setVersion(SnmpConstants.version2c);// 

			target.setAddress(new UdpAddress(host + "/" + port));//

		

			target.setRetries(1); // 

			target.setTimeout(3000); //

			snmp.listen(); // 

			PDU request = new PDU(); // new request PDU

			// set pud type and set oid

			request.setType(PDU.GET); //

			// device type
			request.add(new VariableBinding(oid));

			// System.out.println("request UDP:" + request);

			PDU response = null;

			ResponseEvent responseEvent = snmp.send(request, target); //
											

	

			response = responseEvent.getResponse();

		

			if (response != null) {

				if (response.getErrorIndex() == response.noError
						&& response.getErrorStatus() == response.noError) {

					VariableBinding recVB = (VariableBinding) response
							.getVariableBindings().elementAt(0);

					result = recVB.getVariable().toInt();

				}
			}

			snmp.close();

		} catch (IOException e) {

			// TODO Auto-generated catch block

			e.printStackTrace();

		}

		return result;

	}
	
	public int gethfcINT32PDU(String host, String port, OID oid,String community)
		throws IOException {
		int result = -1;
		try {
		
			Snmp snmp = new Snmp(new DefaultUdpTransportMapping());
		
			CommunityTarget target = new CommunityTarget();
			
			target.setCommunity(new OctetString(community));// 
		
			target.setVersion(SnmpConstants.version1);// 
		
			target.setAddress(new UdpAddress(host + "/" + port));//
		
		
		
			target.setRetries(1); // 
		
			target.setTimeout(3000); //
		
			snmp.listen(); // 
		
			PDU request = new PDU(); // new request PDU
		
			// set pud type and set oid
		
			request.setType(PDU.GET); //
		
			// device type
			request.add(new VariableBinding(oid));
		
			// System.out.println("request UDP:" + request);
		
			PDU response = null;
		
			ResponseEvent responseEvent = snmp.send(request, target); //
											
		
		
		
			response = responseEvent.getResponse();
		
		
		
			if (response != null) {
		
				if (response.getErrorIndex() == response.noError
						&& response.getErrorStatus() == response.noError) {
		
					VariableBinding recVB = (VariableBinding) response
							.getVariableBindings().elementAt(0);
		
					result = recVB.getVariable().toInt();
		
				}
			}
		
			snmp.close();
		
		} catch (IOException e) {
		
			// TODO Auto-generated catch block
		
			e.printStackTrace();
		
		}
		
		return result;
	
	}

}
