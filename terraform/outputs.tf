output "app_ip" {
  value = aws_eip.app_ip.public_ip
}

output "jenkins_ip" {
  value = aws_eip.jenkins_ip.public_ip
}