import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '../environment';

class Profile extends React.Component {

  render() {
    let {alumni} = this.props;
    return (
      <Paper>
        <Typography variant="title">{alumni.first_name} {alumni.last_name}</Typography>
      </Paper>
    )
  }
}


@withStyles(theme => ({
  center: {
    textAlign: 'center'
  }
}))
export default class extends React.Component {

  render() {
    let {id, classes} = this.props;
    return (
      <QueryRenderer 
        environment={environment}
        query={graphql`
          query ProfileQuery($id: ID!) {
            alumni: node(id: $id) {
              id
              ... on Alumni {
                first_name
                last_name
              }
            }
          }
        `}
        variables={{id}}
        render={({error, props}) => (
          props && props.alumni ? 
            <Profile alumni={props.alumni} /> : 
            <div className={classes.center}><CircularProgress /></div>
         )} />
    );
  }

}