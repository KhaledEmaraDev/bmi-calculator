pipeline {
  agent any

  options {
      ansiColor('xterm')
  }

  stages {
    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Code Checks') {
      failFast true

      parallel {
        stage('Unit Tests and Code Coverage') {
          steps {
            sh 'CI=true npm run test -- --coverage'

            publishHTML (
              target: [
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: false,
                reportDir: 'coverage',
                reportFiles: 'index.html',
                reportName: 'Code Coverage',
                reportTitles: 'Code Coverage'
              ]
            )
          }
        }

        stage('Code Style Conformance') {
          steps {
            sh 'npx prettier --check . || true'
          }
        }

        stage('Syntax Errors Check') {
          steps {
            sh 'npx eslint src'
          }
        }

        stage('Performance Testing') {
          steps {
            sh 'CI=true npm run perf-test'
          }
        }

        stage('Security Testing') {
          steps {
            sh 'npm audit || true'
          }
        }
      }
    }

    stage('Build Container') {
      steps {
        sh 'docker build -t khaledemaradev/b-g-lb:latest haproxy'
        sh 'docker build -t khaledemaradev/bmi-calculator:latest .'
      }
    }

    stage('Store Image Artifact') {
      environment {
        DOCKER_HUB_PASS = credentials('docker-hub-pass')
      }

      steps {
        sh 'echo $DOCKER_HUB_PASS | docker login --username khaledemaradev --password-stdin'
        sh 'docker push khaledemaradev/b-g-lb:latest'
        sh 'docker push khaledemaradev/bmi-calculator:latest'
      }
    }

    stage('Deploy') {
      steps {
        script {
          def isLoadBalancerRunning = sh(
            script: "docker inspect --format='{{json .State.Running}}' blue-green-loadbalancer || echo 'false'",
            returnStdout: true
          ).trim()
          def isBlueContainerRunning = sh(
            script: "docker inspect --format='{{json .State.Running}}' blue || echo 'false'",
            returnStdout: true
          ).trim()
          def isGreenContainerRunning = sh(
            script: "docker inspect --format='{{json .State.Running}}' green || echo 'false'",
            returnStdout: true
          ).trim()

          if(isLoadBalancerRunning == 'false') {
            if(isBlueContainerRunning == 'false') {
              sh 'docker run --name blue -d --network bmi-calculator khaledemaradev/bmi-calculator:latest'
            }
            if(isGreenContainerRunning == 'false') {
              sh 'docker run --name green -d --network bmi-calculator khaledemaradev/bmi-calculator:latest'
            }
            sh 'docker run --name blue-green-loadbalancer -d --network bmi-calculator -p 9997:80 -p 9996:1936 khaledemaradev/b-g-lb:latest'
          }

          def blueWeight = sh(
            script: 'docker exec blue-green-loadbalancer sh -c "echo get weight webapp/blue | socat stdio /var/run/haproxy.sock" | awk \'{ print $1 }\'',
            returnStdout: true
          ).trim()

          if (blueWeight == '100') {
            sh 'docker rm -f green'
            sh 'docker run --name green -d --network bmi-calculator khaledemaradev/bmi-calculator:latest'
            sh 'docker exec blue-green-loadbalancer sh -c "echo set weight webapp/green 100 | socat stdio /var/run/haproxy.sock"'
            sh 'docker exec blue-green-loadbalancer sh -c "echo set weight webapp/blue 0 | socat stdio /var/run/haproxy.sock"'
          } else {
            sh 'docker rm -f blue'
            sh 'docker run --name blue -d --network bmi-calculator khaledemaradev/bmi-calculator:latest'
            sh 'docker exec blue-green-loadbalancer sh -c "echo set weight webapp/blue 100 | socat stdio /var/run/haproxy.sock"'
            sh 'docker exec blue-green-loadbalancer sh -c "echo set weight webapp/green 0 | socat stdio /var/run/haproxy.sock"'
          }
        }
      }
    }

    stage('E2E Testing') {
      steps {
        sh 'npx cypress run'
      }
    }
  }

  post {
    failure {
      mail to: 'mail@KhaledEmara.dev',
      subject: "Job '${JOB_NAME}' (${BUILD_NUMBER}) is finished",
      body: "Please go to ${BUILD_URL} and verify the build"
    }

    success {
      mail to: 'mail@KhaledEmara.dev',
      subject: "Job '${JOB_NAME}' (${BUILD_NUMBER}) is finished",
      body: "Please go to ${BUILD_URL} and verify the build"
    }
  }
}
