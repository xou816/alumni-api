import {commitMutation, graphql} from 'react-relay';
import environment from './environment';

const mutation = graphql`
  mutation addSourceMutation($source: String, $credentials: Credentials) {
    addSource(source: $source, credentials: $credentials) {
      id
      key
      enabled
    }
  }
`;

export default function(source, username, password) {
	return new Promise((resolve, reject) => {
		commitMutation(environment, {
			mutation,
			variables: {source, credentials: {username, password}},
			onCompleted: (res, err) => err ? reject(err) : resolve(res),
			onError: (err) => reject(err)
		});
	});
}