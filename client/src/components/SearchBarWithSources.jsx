import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '../environment';
import SearchBar from './SearchBar';
import WarningMessage from './WarningMessage';
import Fade from '@material-ui/core/Fade';

const styles = theme => ({
  center: {
    textAlign: 'center'
  }
});

@withStyles(styles)
export default class SearchBarWithSources extends React.Component {

  render() {
      let {classes, query, onSearch, onSourceSelect, selected} = this.props;
      return (
        <QueryRenderer 
          environment={environment}
          query={graphql`
            query SearchBarWithSourcesQuery {
              source {
                name
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
                  let source = props && props.source && selected > 0 ? props.source[selected-1].name : 'all'
                   onSearch({...query, source })
                }} />
              {
                props && props.source && selected > 0 && !props.source[selected-1].enabled ?
                  <Fade in><WarningMessage>Source is not configured!</WarningMessage></Fade> :
                  null
              }
            </React.Fragment>
            )} />
      );
    }
}