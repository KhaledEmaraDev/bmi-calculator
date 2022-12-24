# DevOps Flow Demo

This project uses the `bmi-calculator` React example to demonstrate DevOps practices
using a CI/CD piepleing built on top of Jenkins.

## File Structure

| Path                                | Purpose                                            |
| ----------------------------------- | -------------------------------------------------- |
| src                                 | Contains the source code for the Web App           |
| src/components/App/App.test.js      | Unit Tests for the React component App             |
| src/components/App/App.perf.test.js | Performance Tests for the React component App      |
| cypress                             | Contains E2E Tests                                 |
| haproxy                             | Contains Blue/Green Deployment Loadbalancer files  |
| Dockerfile                          | Create a container Image for the Web App           |
| Jenkinsfile                         | Contains instructions for Jenkins to run the CI/CD |

## Containerization

As with every DevOps flow the first step is to containerize each application.
This has the benfit of making it easier to test each app separately and localize
errors making it easier to rollback. Plus, we get the extra benefit of speedier
builds.

I used Docker to create the container Image. This can be seen in the `Dockerfile`.
I used the `node:19.3.0-alpine3.17` image as the base for my app, as Node.js 19 is
the latest build supported by the app I'm containerizing, and I used alpine to
make use of the its smaller image size.

Finally, I created another stage with `nginx:1.23.3-alpine` to serve the app as
I don't need Node.js to serve my application. This creates a much smaller final
Image.

## Tests

An Integral part of the Software Development Lifecyle of any project is its tests.
For this I used three types of tests.

### Unit Tests

Theses are smaller tests that test individual components of the App separately.
I created a simple enough test at `src/components/App/App.test.js` to demonstrate
this.

### Perf Tests

Theses are tests that benchmark the applications against a known threshold to
compare its performance to the desired requirements.
I create the a simple test that benchmarks the render speed at
`src/components/App/App.perf.test.js`.

### E2E Tests

Finally, I made use of the existing E2E tests in the repo I forked to run Cypress.
It basically uses a staging environment (A live build of the App) to run some
tests that test the application as a while from end to end.

## Integartion

To integarte all these tests on every code commit I used Jenkins to create a
pipeline that triggers on every push to GitHub. This was done using GitHub's
webhook to inform Jenkins of any push in integration with the GitHub plugin
for Jenkins.

I also added some extra stages for the integration. You can have a look at
`Jenkinsfile` to see all this.

### Code Checks

I run some stages that are independent of each other parallely:

#### Unit Tests and Code Coverage

I used Jest to create a coverage report in HTML and then archived this report as
an artifact.

#### Code Style Conformance

I make sure the code style conforms to a predefined style specified at `.prettierrc.js`.

#### Syntax Errors Check

I used the most popular linter for JavaScript to check for any errors in the code.

#### Performance Testing

This runs the tests mentioned earlier.

#### Security Testing

I use `npm audit` to report any vulnerabilities in the packages I'm using.

### Building the Image

I then build the Container Image using Docker and upload this build artifact
to the most popular Image Repository: Docker Hub.

## Delivery

For Delivery I decided to use the Blue/Green deployment model.
Fist the preferred way to do this is with K8s's own `Deployment`.

But for the sake of this demo I'm using `HAProxy` to load balance the traffic
across two containers. At first the loadbalancer directs all the traffic to
the `blue` container. This is done be setting its weight to `100` and setting
the `green` container's weight to `0`.

When deploying a new code change, I stop the container that's not running (the
one with weight `0`) and deploy the new code change. If its checks pass I reroute
the traffic to the new container by reversing the weights.

To better understand this have a look at the backend section in `haproxy/haproxy.cfg`.
It contains the two containers `blue` and `green` with their hostname and weights.
The weights can be configuted at runtime by communicating with HAProxy. This can be
clearly seen in the `Deploy` stage in Jenkins.

### Building the container

I created another Docker context in the directory `haproxy`. I just copy the config file.

All three containers are run in same **Docker Network**: `bmi-calculator` to be able
to privatley communicate with each other.

### E2E Tests

I run E2E tests after deploying because they need a live hostname to test.

## Alerting

For alerting I went with a super simple email notification on Success or Failure.

## Metrics

For metrics I decided to use `prometheus` and `node-exporter` to export performance
metrics of the server hosting Jenkins.

## Demo

You can find the everything realted to the Demo in the `demo` directory.
Including a showcase video, a presentation, and the link the the GitHub repo.
