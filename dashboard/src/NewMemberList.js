import React, { Component } from 'react';
import './NewMemberList.css';
import { ResponsiveBar } from '@nivo/bar';
import axios from 'axios';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import nblocale from 'date-fns/locale/nb';
import arildBilde from './arild.jpeg';
import lanBilde from './lan.jpeg';

var API_GET_DOORS_URL = "http://amiculous.com/doors";
var API_GET_DOORS_EXTENDED = "http://amiculous.com/doors/extended";
var NOTIFICATION_TRESHOLD_MINUTES = 3;

class NewMemberList extends Component {
  state = {
    new_members: [],
    lists: 0,
    doors: [[]],
    doors_extended: [[]]
  };

  getItems() {
    axios
      .get(API_GET_DOORS_URL)
      .then(response => {
          const newState = { doors: response.data };
        this.setState(newState);
      })
      .catch(error => console.log(error));
    axios
      .get(API_GET_DOORS_EXTENDED)
      .then(response => {
        const newState = { doors_extended: response.data };
        this.setState(newState);
      })
      .catch(error => console.log(error));
  }

  componentDidMount() {
    this.timer = setInterval(
      () => this.getItems(),
      NOTIFICATION_TRESHOLD_MINUTES * 60 * 1000
    );
    this.getItems();
  }

  componentWillUnmount() {
    this.timer = null;
  }

  defaultPage() {
    return (
      <div className="NewMemberList"><h2>STÅ PÅ, MILJØHELTER!</h2>
        <img alt="Lan på aksjon" src={lanBilde} width='1000px'/>
      </div>
    );
  }

  createDoorStat(doorStat) {
    const description = doorStat[0];
      const value = doorStat[1];
      const target = doorStat[2];
      return (<tr><th>{description}</th><td>{value}</td><td><small>({target})</small></td></tr>);
  }

  createDoorStats() {
      let idx = [0,4,5];
      let filteredDoors = idx.map(idx => this.state.doors[idx]).filter(item => item);
      return (
      <div className="doorStats">
        <table><tbody>{filteredDoors.map(this.createDoorStat)}</tbody></table>
      </div>
    );
  }

  createBarChart() {
    let data = this.createData();
    let doordata = this.state.doors;
    let data2 = this.state.doors_extended;
    let visitKeys = [0,4,5];
    let visitData = [];
    visitKeys.forEach((idx) => 
      {if (doordata[idx] != null){
        visitData.push({name: doordata[idx][0], 
          målprosent: doordata[idx][1]/doordata[idx][2]*100, 
          utført: doordata[idx][1],
          restprosent:(doordata[idx][2] - doordata[idx][1])/doordata[idx][2]})
     }})

    const MyResponsiveBar = () => (
      <ResponsiveBar
        data={visitData}
        keys={['målprosent']}
        indexBy="name"
        margin={{ top: 50, right: 130, bottom: 180, left: 150 }}
        padding={0.3}
        colors={{ scheme: 'nivo' }}
 
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -30,
          legendPosition: 'middle',
          legendOffset: 32
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: '% av målet',
          legendPosition: 'middle',
          legendOffset: -80
        }}
        label={({data}) => data.utført}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        tooltip={({ data }) => (
          data.name + " " + data.utført
        )}
        theme={{
          axis: {
            ticks: {
              text: {
                fontSize: "30px"
              }
            },
            legend: {
              text: {
                fontSize: "30px"
              }
            }
          },
          labels: {
            text: {
              fontSize: "25px"
            }
          }
        }}
      />
    );
    return MyResponsiveBar;
  }

  createData() {
    return [];
  }

  render() {
    let graphItem;
    graphItem = this.defaultPage();
    var doorStats = this.createDoorStats();
    //   var barChart = this.createBarChart()(this.state.doors);
    console.log(this.createData().length)
    var barChart = this.createBarChart()(this.createData());
    console.log(barChart);
    const electionDay = new Date(2019, 8, 9, 20);
    const timeToElection = distanceInWordsToNow(electionDay, { locale: nblocale });
    return (
      <div className="app">
        <h1 className="headerNumbers">
          <div className="numberBox">
            {doorStats}
            <div className="text">{timeToElection} igjen til valget!</div>
          </div>
        </h1>
        {graphItem}
      </div>
    );
  }
}

/*
To be put after </h1>:
        <div style={{width:1000,height:800}}>
          {barChart}
        </div>
*/
export default NewMemberList;
