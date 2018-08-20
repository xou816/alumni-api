import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '../environment';
import SearchBar from './SearchBar';
import WarningMessage from './WarningMessage';
import AddSourceDialog from './AddSourceDialog';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  button: {
    color: theme.palette.primary.contrastText
  }
});

@withStyles(styles)
class Warning extends React.Component {

  state = {open: false}

  render() {
    let {source, classes} = this.props;
    let {open} = this.state;
    return (
      <Fade in>
        <WarningMessage>
          Source is not configured!
          <Button className={classes.button} onClick={() => this.setState({ open: true })}>Configure</Button>
          <AddSourceDialog open={open} source={source} handleClose={() => this.setState({ open: false })} />
        </WarningMessage>
      </Fade>
    );
  }
}

export default class SearchBarWithSources extends React.Component {

  render() {
      let {classes, query, onSearch, onSourceSelect, selected} = this.props;
      return (
        <QueryRenderer 
          environment={environment}
          query={graphql`
            query SearchBarWithSourcesQuery {
              source {
                id
                key
                enabled
              }
            }
            `}
          variables={query}
          render={({error, props}) => (
            <React.Fragment>
              <SearchBar 
                sources={props && props.source ? props.source : []}
                selected={selected}
                onSourceSelect={onSourceSelect} 
                onSearch={query => {
                  if (props && props.source) {
                    onSearch({...query, source: props.source[selected].key })                  
                  }
                }} />
              { props && props.source && !props.source[selected].enabled ? 
                  <Warning source={props.source[selected].key} /> : null }
            </React.Fragment>
            )} />
      );
    }
}