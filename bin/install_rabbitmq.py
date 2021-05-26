#!/usr/bin/python
## get subprocess module 
import subprocess
import sys
import os

def install_erlang():
	# create file /etc/yum.repos.d/rabbitmq_erlang.repo
	f= open("/etc/yum.repos.d/rabbitmq_erlang.repo","w+")
	f.truncate(0)
	f.write('[rabbitmq_erlang]\n\
name=rabbitmq-rabbitmq-erlang\n\
baseurl=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/rpm/el/7/$basearch\n\
repo_gpgcheck=1\n\
enabled=1\n\
gpgkey=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/gpg.E495BB49CC4BBE5B.key\n\
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc\n\
gpgcheck=1\n\
sslverify=1\n\
sslcacert=/etc/pki/tls/certs/ca-bundle.crt\n\
metadata_expire=300\n\
pkg_gpgcheck=1\n\
autorefresh=1\n\
type=rpm-md\n\
\n\
[rabbitmq_erlang-noarch]\n\
name=rabbitmq-rabbitmq-erlang-noarch\n\
baseurl=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/rpm/el/7/noarch\n\
repo_gpgcheck=1\n\
enabled=1\n\
gpgkey=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/gpg.E495BB49CC4BBE5B.key\n\
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc\n\
gpgcheck=1\n\
sslverify=1\n\
sslcacert=/etc/pki/tls/certs/ca-bundle.crt\n\
metadata_expire=300\n\
pkg_gpgcheck=1\n\
autorefresh=1\n\
type=rpm-md\n\
\n\
[rabbitmq_erlang-source]\n\
name=rabbitmq-rabbitmq-erlang-source\n\
baseurl=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/rpm/el/7/SRPMS\n\
repo_gpgcheck=1\n\
enabled=1\n\
gpgkey=https://dl.cloudsmith.io/public/rabbitmq/rabbitmq-erlang/gpg.E495BB49CC4BBE5B.key\n\
       https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc\n\
gpgcheck=1\n\
sslverify=1\n\
sslcacert=/etc/pki/tls/certs/ca-bundle.crt\n\
metadata_expire=300\n\
pkg_gpgcheck=1\n\
autorefresh=1\n\
type=rpm-md'
	) 

	f.close()
	print("FILE : /etc/yum.repos.d/rabbitmq_erlang.repo created.")
	# yum update
	p_yum_update = subprocess.Popen('yum --disablerepo="*" --enablerepo="rabbitmq_erlang" update -y', stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True) 
	(output, err) = p_yum_update.communicate()

	## Wait for terminate. Get return returncode ##
	p_yum_update_status = p_yum_update.wait()
	out = output.decode('utf-8')
	
	if p_yum_update_status != 0:
		print("Yum Update err : "+ str(err))
		sys.exit("Yum Update exited with status/return code : "+ str(p_yum_update_status))

	print("Yum Updated.")
	#yum install -y erlang-23.3.4
	p_install_erlang = subprocess.Popen('yum install -y erlang-23.3.4', stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True) 
	(erlang_output, err) = p_install_erlang.communicate()

	## Wait for terminate. Get return returncode ##
	p_install_erlang_status = p_install_erlang.wait()
	p_install_erlang_out = erlang_output.decode('utf-8')
	
	if p_install_erlang_status != 0:
		print("Yum Erlang Installation err : "+ str(err))
		sys.exit("Yum Erlang Installation exited with status/return code : "+ str(p_install_erlang_status))

	print("Yum Erlang installation done.")

def install_rabbitmq():
	# create file /etc/yum.repos.d/rabbitmq_server.repo
	f= open("/etc/yum.repos.d/rabbitmq_server.repo","w+")
	f.truncate(0)
	f.write('[rabbitmq_server]\n\
name=rabbitmq_server\n\
baseurl=https://packagecloud.io/rabbitmq/rabbitmq-server/el/7/$basearch\n\
repo_gpgcheck=1\n\
gpgcheck=0\n\
enabled=1\n\
gpgkey=https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey\n\
sslverify=1\n\
sslcacert=/etc/pki/tls/certs/ca-bundle.crt\n\
metadata_expire=300') 

	f.close()

	#yum install rabbitmq-server -y
	p_install_rabbitmq = subprocess.Popen('yum install rabbitmq-server -y', stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True) 
	(rmq_output, err) = p_install_rabbitmq.communicate()

	## Wait for terminate. Get return returncode ##
	p_install_rabbitmq_status = p_install_rabbitmq.wait()
	p_install_rabbitmq_out = rmq_output.decode('utf-8')
	
	if p_install_rabbitmq_status != 0:
		print("Yum RabbitMQ Server Installation err : "+ str(err))
		sys.exit("Yum RabbitMQ Server Installation exited with status/return code : "+ str(p_install_rabbitmq_status))	
	print("RabbitMQ Server installation done.")

def install(name_str):
	if(os_ubuntu in name_str):
		p_install = subprocess.Popen('sudo apt-get install rabbitmq-server -y', stdout=subprocess.PIPE, 
           stderr=subprocess.STDOUT, shell=True) 
		(output, err) = p_install.communicate()
 
		## Wait for terminate. Get return returncode ##
		p_install_status = p_install.wait()
		out = output.decode('utf-8')
		
		if p_install_status != 0:
			print("Install err : "+ str(err))
			sys.exit("Installation on Ubuntu exited with status/return code : "+ str(p_install_status))
		else:
			print("Installation done : "+ out)
	else:
		#for other os
		install_erlang()
		install_rabbitmq()
		#start and enable rabbitmq server
		os.system('systemctl start rabbitmq-server')
		os.system('systemctl enable rabbitmq-server')
		print("Rabbit MQ Started. Use 'rpm -qi rabbitmq-server' to verify.")



if __name__ == '__main__':	

	p = subprocess.Popen('grep \'^NAME\' /etc/os-release', stdout=subprocess.PIPE, 
	           stderr=subprocess.STDOUT, shell=True) 
	(output, err) = p.communicate()
	 
	## Wait for date to terminate. Get return returncode ##
	p_status = p.wait()
	out = output.decode('utf-8')

	if p_status != 0:

		print("Command err : "+ str(err))
		print("Command exit status/return code : "+ str(p_status))
		sys.exit(" Problem while Installing. OS name could not be fetched.")

	#split on \n
	name_lines = out.split("\n")

	name = name_lines[0].split("=")

	os_ubuntu = "Ubuntu"

	if name and name[1]:
		print("OS : "+str(name[1]))
		install(str(name[1]))
	else:
		sys.exit(" Problem while fetching OS name.")	



