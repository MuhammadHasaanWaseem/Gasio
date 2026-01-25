import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    marginTop: '15%',
    alignSelf: 'center',
    marginBottom: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  locationIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    color: '#000',
  },
  button: {
    backgroundColor: '#ed3237',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  countryPicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  countryListContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 5,
  },
  countryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    borderWidth: 1,
    color: '#000',
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 8,
    marginTop: 5,
    backgroundColor: '#fff',
  },
});

