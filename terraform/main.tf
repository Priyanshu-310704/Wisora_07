provider "aws" {
  region = "ap-south-1"
}

resource "aws_security_group" "app_sg" {
  name = "app-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9100
    to_port     = 9100
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "app_server" {
  ami           = "ami-07a00cf47dbbc844c"
  instance_type = "t3.micro"
  key_name      = "Wisora-07-key"

  vpc_security_group_ids = [aws_security_group.app_sg.id]

  tags = {
    Name = "Wisora-App"
  }
}
resource "aws_instance" "jenkins_server" {
  ami           = "ami-0388e3ada3d9812da"
  instance_type = "t3.micro"
  key_name      = "wiora-jenkins-dev"

  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              apt update -y
              apt install docker.io -y
              systemctl start docker
              systemctl enable docker

              usermod -aG docker ubuntu

              docker run -d -p 8080:8080 -p 50000:50000 \
                -v jenkins_home:/var/jenkins_home \
                jenkins/jenkins:lts
              EOF
              
  tags = {
    Name = "Wisora-Jenkins"
  }
}
resource "aws_eip" "jenkins_ip" {
  instance = aws_instance.jenkins_server.id
  domain   = "vpc"
}
resource "aws_eip" "app_ip" {
  instance = aws_instance.app_server.id
  domain   = "vpc"
}