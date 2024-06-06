import { Button, Card, Col, Container, Form, Image, InputGroup, ListGroup, ProgressBar, Row } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import DownIcon from './assets/img/down.svg';
import UpIcon from './assets/img/up.svg';
import AvatarImg1 from './assets/img/avatars/Avatar-1.png';
import AvatarImg2 from './assets/img/avatars/Avatar-2.png';
import AvatarImg3 from './assets/img/avatars/Avatar-3.png';
import AvatarImg4 from './assets/img/avatars/Avatar-4.png';
import USDTIcon from './assets/img/usdt.svg';
import StartFlag from './assets/img/start.svg';
import EndFlag from './assets/img/end.svg';

function App() {
  const chartRef = useRef<am5.Root>();
  const [price, setPrice] = useState(0);
  const [result, setResult] = useState(false);
  let tradingResult: boolean = false;

  // useEffect(() => {
  //   setInterval(() => {
  //     setResult(false);
  //   }, 5000);
  // }, [])

  useEffect(() => {
    const root = am5.Root.new("chartdiv");

    // Set themes
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    const chart: any = root.container.children.push(am5xy.XYChart.new(root, {
      focusable: true,
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingTop: 100
    }));

    let easing = am5.ease.linear;

    const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.2,
      groupData: false,
      extraMax: 0.1,
      extraMin: -0.21,
      opacity: 0,
      baseInterval: {
        timeUnit: "millisecond",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {
        // minGridDistance: 20,
        // cellStartLocation: 0.2,
        // cellEndLocation: 0.8
      }),
      tooltip: am5.Tooltip.new(root, {})
    }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      extraTooltipPrecision: 1,
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    xAxis.get("renderer").grid.template.setAll({
      stroke: am5.color(0x161d26),
      opacity: 1 // Red color for the grid lines161d26
    });

    let series = chart.series.push(am5xy.SmoothedXYLineSeries.new(root, {
      name: "PredictionChart",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      stroke: am5.color(0x0063F5),
      tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" })
    }));

    series.strokes.template.setAll({
      stroke: am5.color(0xFFFF00), // Set the series color to yellow
      strokeWidth: 2 // Set the width of the stroke
    });

    series.fills.template.set("fillGradient", am5.LinearGradient.new(root, {
      stops: [{
        color: am5.color(0x0063f5),
        opacity: 0.2
      }, {
        opacity: 0.01
      }],
      rotation: 90
    }));

    series.fills.template.setAll({
      visible: true,
      fillOpacity: 1
    });


    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      xAxis: xAxis
    }));
    cursor.lineY.set("visible", false);

    // Generate initial data
    const generateChartData = () => {
      let chartData = [];
      let firstDate = new Date();
      firstDate.setDate(firstDate.getDate() - 3000);
      firstDate.setHours(0, 0, 0, 0);
      let value = 10000;

      for (var i = 0; i < 150; i++) {
        let newDate = new Date(firstDate);
        newDate.setSeconds(newDate.getMilliseconds() + i);

        value += (Math.random() < 0.25 ? 0.5 : -0.5) * Math.random() * 10;

        chartData.push({
          date: newDate.getTime(),
          value: value
        });
      }
      return chartData;
    };

    const data: any = generateChartData();
    data[data.length - 1].bullet = true;
    series.data.setAll(data);

    series.bullets.push(function (root: any, series: any, dataItem: any) {
      // only create sprite if bullet == true in data context
      if (dataItem.dataContext.bullet) {
        let container = am5.Container.new(root, {});
        let circle0 = container.children.push(am5.Circle.new(root, {
          radius: 5,
          fill: am5.color(0xffffff)
        }));
        let circle1 = container.children.push(am5.Circle.new(root, {
          radius: 7.5,
          fill: am5.color(0xffffff),
          fillGradient: am5.RadialGradient.new(root, {
            stops: [{
              color: am5.color(0xffffff),
              opacity: 0
            }, {
              opacity: 1
            }],
          })
        }));

        let circle2 = container.children.push(am5.Circle.new(root, {
          radius: 50,
          fill: am5.color(0xffffff),
          fillGradient: am5.RadialGradient.new(root, {
            stops: [{
              color: am5.color(0xffffff),
              opacity: 0.15
            }, {
              opacity: 0
            }],
          })
        }));


        circle1.animate({
          key: "radius",
          to: 20,
          duration: 5000,
          easing: am5.ease.out(am5.ease.cubic),
          loops: Infinity
        });
        circle1.animate({
          key: "opacity",
          to: 0,
          from: 1,
          duration: 1000,
          easing: am5.ease.out(am5.ease.cubic),
          loops: Infinity
        });

        return am5.Bullet.new(root, {
          locationX: undefined,
          sprite: container
        })
      }
    })

    let rangeDataItem: any = yAxis.makeDataItem({});
    yAxis.createAxisRange(rangeDataItem);

    rangeDataItem.get("grid").setAll({
      strokeOpacity: 1,
      visible: true,
      stroke: am5.color(0xffffff),
      strokeDasharray: [2, 2]
    });

    // Create Live price container

    let container = am5.Container.new(root, {
      centerY: am5.p50,
      draggable: true,
      layout: root.horizontalLayout
    })

    container.adapters.add("x", function () {
      return am5.percent(88);
    });

    container.adapters.add("y", function (y: any) {
      return Math.max(0, Math.min(chart.plotContainer.height(), y));
    });

    yAxis.topGridContainer.children.push(container);


    rangeDataItem.set("bullet", am5xy.AxisBullet.new(root, {
      sprite: container
    }));

    let label = container.children.push(am5.Label.new(root, {
      paddingTop: 5,
      paddingBottom: 5,
      marginBottom: 0
    }))

    let background = am5.RoundedRectangle.new(root, {
      fill: am5.color(0x0063f5),
      fillOpacity: 1,
      strokeOpacity: 1,
      cursorOverStyle: "ns-resize",
      stroke: am5.color(0x0063f5)
    })

    // let rangeDataItemUp: any = yAxis.makeDataItem({ value: price, endValue: price === 0 ? 99999 : price * 2 });
    // let rangeDataItemDown: any = yAxis.makeDataItem({ value: price, endValue: 0 });
    // yAxis.createAxisRange(rangeDataItemUp);
    // yAxis.createAxisRange(rangeDataItemDown);

    // rangeDataItemUp.get("grid").setAll({
    //     stroke: am5.color(0x00ff33),
    //     strokeOpacity: 0,
    //     strokeDasharray: [5],
    // });

    // rangeDataItemUp.get("axisFill").setAll({
    //     fill: am5.color(0x00ff33),
    //     fillOpacity: 0.25,
    //     visible: true
    // });

    // rangeDataItemDown.get("grid").setAll({
    //     stroke: am5.color(0x00ff33),
    //     strokeOpacity: 0,
    //     strokeDasharray: [5]
    // });

    // rangeDataItemDown.get("axisFill").setAll({
    //     fill: am5.color(0xff4949),
    //     fillOpacity: 0.25,
    //     visible: true,        
    // });

    series.events.on("datavalidated", () => {
      let lastDataItem: any = series.dataItems[series.dataItems.length - 1];
      let lastValue = lastDataItem.get("valueY");
      rangeDataItem.set("value", lastValue);
      // rangeDataItemUp.set("value", lastValue);
      // rangeDataItemDown.set("value", lastValue);
      label.set("html", "<div class='chart-html text-white text-center'><div class='chart-html-title text-uppercase'>Live Bitcoin</div><hr class='py-0 my-1'/><div class='chart-html-value text-uppercase fw-bold fs-5'>" + root.numberFormatter.format(lastValue, "#.00") + "</div></div>");
      setPrice(lastValue);


      container.set("background", background);
    });

    series.children.push(am5.Label.new(root, {
      text: "ROUND IN PROGRESS\nPLACE YOUR TRADE",
      centerX: am5.percent(0),
      centerY: am5.percent(0),
      textAlign: "center",
      fontSize: 18,
      fontWeight: "800",
      fill: am5.color(0xacceff)
    }));



    function createRange(value: any, bullet: any) {
      const rangeDataItem = xAxis.makeDataItem({ value: value });

        xAxis.createAxisRange(rangeDataItem);

        rangeDataItem.get("grid").setAll({
            stroke: am5.color(0xffffff),
            strokeOpacity: 1,
            strokeDasharray: [3],
            strokeWidth: 2,
        });

        rangeDataItem.set("bullet", am5xy.AxisBullet.new(root, {
            location: 0.5,
            sprite: am5.Picture.new(root, {
                width: 50,  // Set width of the image
                height: 50, // Set height of the image
                centerX: am5.percent(50),
                centerY: am5.percent(50),
                src: bullet,  // URL of the image
            }),
        }));
      tradingResult = false;

    }


    chart.appear(1000, 250);

    const addData = () => {
      let lastDataItem: any = series.dataItems[series.dataItems.length - 1];
      let lastData: any = series.data.getIndex(series.data.length - 1);
      let lastValue = lastData.value;
      let newValue = lastValue + (Math.random() < 0.25 ? 0.5 : -0.25) * Math.random() * 10;
      let newDate = new Date(lastData.date + 250); // adds one second to the last date
      // console.log("lastData.date", newDate.getTime())

      if (tradingResult) {
        createRange(new Date(lastData.date + 10000), `${StartFlag}`);
        // createRange(new Date(lastData.date + 30000), `${EndFlag}`);
      }
      series.data.push({
        date: newDate.getTime(),
        value: newValue
      });

      let newDataItem = series.dataItems[series.dataItems.length - 1];
      newDataItem.animate({
        key: "valueYWorking",
        to: newValue,
        from: lastValue,
        duration: 250,
        easing: easing
      });

      newDataItem.bullets = [];
      newDataItem.bullets[0] = lastDataItem.bullets[0];
      newDataItem.bullets[0].get("sprite").dataItem = newDataItem;
      // reset bullets
      lastDataItem.dataContext.bullet = false;
      lastDataItem.bullets = [];

      if (series.data.length > 500) {
        series.data.removeIndex(0);
      }
    };

    const interval = setInterval(addData, 250);
    xAxis.get("renderer").labels.template.setAll({
      fill: root.interfaceColors.get("alternativeText")
    });
    yAxis.get("renderer").labels.template.setAll({
      fill: root.interfaceColors.get("alternativeText")
    });
    root.interfaceColors.set("grid", am5.color(0xffffff));

    chartRef.current = root;

    return () => {
      clearInterval(interval);
      root.dispose();
    };
  }, []);

  const ResultBoard = (data: any) => {
    return (
      <div className={`h-100 d-flex result-board align-items-center flex-column justify-content-center ${data.type}`}>
        <div className={`text-center fs-2 fw-bold ${data.value === "Winner" && "text-success"} ${data.value === "Loser" && "text-danger"}`}>{data.players}</div>
        <div className={`text-center fs-2 fw-bold text-uppercase ${data.value === "Winner" && "text-success"} ${data.value === "Loser" && "text-danger"}`}>{data.value}</div>
        <div className={`text-center fs-2 fw-bold ${data.value === "Winner" && "text-success"} ${data.value === "Loser" && "text-danger"}`}>$ {data.amount}</div>
      </div>
    )
  }

  useEffect(() => {
    setTimeout(() => {
      tradingResult = true;
    }, 2000);
  }, []);

  return (
    <div className="App mt-5">
      <Container fluid className='py-5'>
        <Row>
          <Col xs={12} sm={8}>
            <Row className='text-white align-items-center mb-3'>
              <Col xs={4} sm={4} className='text-start'>
                <div className='text-uppercase mb-2'>Your Investment</div>
                <div className='d-flex align-items-center mb-4'>
                  <Image src={USDTIcon} width={35} alt='coin' className='me-2' />
                  <div className='fs-4 fw-bold'>$10</div>
                </div>
                <div className='text-uppercase mb-2'>Potential Return</div>
                <div className='d-flex align-items-center mb-3'>
                  <Image src={USDTIcon} width={35} alt='coin' className='me-2' />
                  <div className='fs-4 fw-bold'>$20</div>
                </div>
              </Col>
              <Col xs={4} sm={4} className='fs-5'></Col>
              <Col xs={4} sm={4} className='text-end'>
                <div className='text-uppercase mb-2'>Your Investment</div>
                <div className='d-flex align-items-center justify-content-end mb-4'>
                  <Image src={USDTIcon} width={35} alt='coin' className='me-2' />
                  <div className='fs-4 fw-bold'>$10</div>
                </div>
                <div className='text-uppercase mb-2'>Potential Return</div>
                <div className='d-flex align-items-center justify-content-end mb-3'>
                  <Image src={USDTIcon} width={35} alt='coin' className='me-2' />
                  <div className='fs-4 fw-bold'>$20</div>
                </div>
              </Col>
            </Row>
            <Row className='text-white align-items-center mb-3'>
              <Col xs={4} sm={2} className='fs-5 text-end fw-bold'>00:58</Col>
              <Col xs={4} sm={8} className='fs-5'><ProgressBar animated variant="success" now={78} /></Col>
              <Col xs={4} sm={2} className='fs-5 text-start fw-bold'>1min</Col>
            </Row>
            <Row>
              <Col xs={12} className='mb-3'>
                <div id="chartdiv" style={{ width: "100%", height: "450px" }}></div>
              </Col>
              <Col xs={12}>
                <Card className='border-0 h-100 rounded-3' style={{ background: '#18202a' }}>
                  <Card.Body>
                    <Row>
                      <Col xs={12} sm={4} className=''>
                        <InputGroup className='bg-transparent border border-1 rounded-3 p-1'>
                          <InputGroup.Text className='bg-transparent border-0'>
                            <Image src={USDTIcon} width={25} alt='USDT' />
                          </InputGroup.Text>
                          <Form.Control
                            placeholder="Recipient's username"
                            aria-label="Recipient's username with two button addons"
                            className='bg-transparent text-white fs-6 border-0'
                          />
                          <Button variant="outline-secondary" className='border-0 bg-'>Button</Button>
                          <Button variant="outline-secondary" className='border-0 bg-'>Button</Button>
                        </InputGroup>
                      </Col>
                      <Col xs={12} sm={8} className=''>
                        <Row>
                          <Col xs={2}><Button className='text-uppercase w-full bg-transparent fs-sm-4'>5</Button></Col>
                          <Col xs={2}><Button className='text-uppercase w-full bg-transparent fs-sm-4'>10</Button></Col>
                          <Col xs={2}><Button className='text-uppercase w-full bg-transparent fs-sm-4'>25</Button></Col>
                          <Col xs={2}><Button className='text-uppercase w-full bg-transparent fs-sm-4'>50</Button></Col>
                          <Col xs={2}><Button className='text-uppercase w-full bg-transparent fs-sm-4'>75</Button></Col>
                          <Col xs={2}><Button className='text-uppercase w-full bg-transparent fs-sm-4'>100</Button></Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={6} className='mt-5'><Button className='btn-danger fs-4 text-uppercase fw-bold w-100'>Down</Button></Col>
                      <Col xs={6} className='mt-5'><Button className='btn-success fs-4 text-uppercase fw-bold w-100'>Up</Button></Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col xs={12} sm={4}>
            <Card className='border-0 h-100 rounded-3' style={{ background: '#18202a' }}>
              <Card.Body>
                <Row className='h-75'>
                  <Col xs={12} sm={6}>
                    <div className='text-center'>
                      <Image src={DownIcon} width={50} />
                      <div className='text-danger fs-5 fw-bold text-uppercase'>Down</div>
                    </div>
                    {result && <ResultBoard players={3} value='Winner' amount={80} type="down" />}
                    {!result && (
                      <div className='trader-board'>
                        <Card className='border-top down-trader-card border-0 border-5  border border-danger'>
                          <Card.Body>
                            <div className='d-flex align-items-center justify-content-between'>
                              <span className='text-white fw-bold'>Players <strong className='text-danger fw-bold'>4</strong></span>
                              <span className='text-danger fw-bold'>40</span>
                            </div>
                            <div className='d-flex align-items-center justify-content-between fs-5 mt-3'>
                              <span className='text-white fw-bold'>Players</span>
                              <span className='text-white fw-bold'>4</span>
                            </div>
                          </Card.Body>
                        </Card>
                        <hr className='text-white' />
                        <ListGroup className='bg-transparent'>
                          <ListGroup.Item className='bg-transparent text-white border-0 fw-bold'>
                            <div className='d-flex align-items-center justify-content-between'>
                              <div className='d-flex align-items-center'>
                                <Image src={AvatarImg4} width={35} alt='avatar' className='rounded-3 me-2' />
                                <small className='me-2'>Salonme Wal...</small>
                              </div>
                              <div className='d-flex align-items-center '>
                                <small className='me-2'>$ 10</small>
                                <Image src={USDTIcon} width={25} alt='avatar' className='rounded-3' />
                              </div>
                            </div>
                          </ListGroup.Item>
                          <ListGroup.Item className='bg-transparent text-white border-0 fw-bold'>
                            <div className='d-flex align-items-center justify-content-between'>
                              <div className='d-flex align-items-center'>
                                <Image src={AvatarImg3} width={35} alt='avatar' className='rounded-3 me-2' />
                                <small className='me-2'>Salonme Wal...</small>
                              </div>
                              <div className='d-flex align-items-center '>
                                <small className='me-2'>$ 10</small>
                                <Image src={USDTIcon} width={25} alt='avatar' className='rounded-3' />
                              </div>
                            </div>
                          </ListGroup.Item>
                          <ListGroup.Item className='bg-transparent text-white border-0 fw-bold'>
                            <div className='d-flex align-items-center justify-content-between'>
                              <div className='d-flex align-items-center'>
                                <Image src={AvatarImg2} width={35} alt='avatar' className='rounded-3 me-2' />
                                <small className='me-2'>Salonme Wal...</small>
                              </div>
                              <div className='d-flex align-items-center '>
                                <small className='me-2'>$ 10</small>
                                <Image src={USDTIcon} width={25} alt='avatar' className='rounded-3' />
                              </div>
                            </div>
                          </ListGroup.Item>
                          <ListGroup.Item className='bg-transparent text-white border-0 fw-bold'>
                            <div className='d-flex align-items-center justify-content-between'>
                              <div className='d-flex align-items-center'>
                                <Image src={AvatarImg1} width={35} alt='avatar' className='rounded-3 me-2' />
                                <small className='me-2'>Salonme Wal...</small>
                              </div>
                              <div className='d-flex align-items-center '>
                                <small className='me-2'>$ 10</small>
                                <Image src={USDTIcon} width={25} alt='avatar' className='rounded-3' />
                              </div>
                            </div>
                          </ListGroup.Item>
                        </ListGroup>
                      </div>
                    )}

                  </Col>
                  <Col xs={12} sm={6}>
                    <div className='text-center'>
                      <Image src={UpIcon} width={50} />
                      <div className='text-success fs-5 fw-bold text-uppercase'>Up</div>
                    </div>
                    {result && <ResultBoard players={3} value='Loser' amount={80} type="up" />}
                    {!result && (
                      <div className='trader-board'>
                        <Card className='border-top up-trader-card border-0 border-5  border border-success'>
                          <Card.Body>
                            <div className='d-flex align-items-center justify-content-between'>
                              <span className='text-white fw-bold'>Players <strong className='text-success fw-bold'>4</strong></span>
                              <span className='text-success fw-bold'>40</span>
                            </div>
                            <div className='d-flex align-items-center justify-content-between fs-5 mt-3'>
                              <span className='text-white fw-bold'>Players</span>
                              <span className='text-white fw-bold'>4</span>
                            </div>
                          </Card.Body>
                        </Card>
                        <hr className='text-white' />
                        <ListGroup className='bg-transparent'>
                          <ListGroup.Item className='bg-transparent text-white border-0 fw-bold'>
                            <div className='d-flex align-items-center justify-content-between'>
                              <div className='d-flex align-items-center'>
                                <Image src={AvatarImg4} width={35} alt='avatar' className='rounded-3 me-2' />
                                <small className='me-2'>Salonme Wal...</small>
                              </div>
                              <div className='d-flex align-items-center '>
                                <small className='me-2'>$ 10</small>
                                <Image src={USDTIcon} width={25} alt='avatar' className='rounded-3' />
                              </div>
                            </div>
                          </ListGroup.Item>
                          <ListGroup.Item className='bg-transparent text-white border-0 fw-bold'>
                            <div className='d-flex align-items-center justify-content-between'>
                              <div className='d-flex align-items-center'>
                                <Image src={AvatarImg3} width={35} alt='avatar' className='rounded-3 me-2' />
                                <small className='me-2'>Salonme Wal...</small>
                              </div>
                              <div className='d-flex align-items-center '>
                                <small className='me-2'>$ 10</small>
                                <Image src={USDTIcon} width={25} alt='avatar' className='rounded-3' />
                              </div>
                            </div>
                          </ListGroup.Item>
                          <ListGroup.Item className='bg-transparent text-white border-0 fw-bold'>
                            <div className='d-flex align-items-center justify-content-between'>
                              <div className='d-flex align-items-center'>
                                <Image src={AvatarImg2} width={35} alt='avatar' className='rounded-3 me-2' />
                                <small className='me-2'>Salonme Wal...</small>
                              </div>
                              <div className='d-flex align-items-center '>
                                <small className='me-2'>$ 10</small>
                                <Image src={USDTIcon} width={25} alt='avatar' className='rounded-3' />
                              </div>
                            </div>
                          </ListGroup.Item>
                          <ListGroup.Item className='bg-transparent text-white border-0 fw-bold'>
                            <div className='d-flex align-items-center justify-content-between'>
                              <div className='d-flex align-items-center'>
                                <Image src={AvatarImg1} width={35} alt='avatar' className='rounded-3 me-2' />
                                <small className='me-2'>Salonme Wal...</small>
                              </div>
                              <div className='d-flex align-items-center '>
                                <small className='me-2'>$ 10</small>
                                <Image src={USDTIcon} width={25} alt='avatar' className='rounded-3' />
                              </div>
                            </div>
                          </ListGroup.Item>
                        </ListGroup>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
