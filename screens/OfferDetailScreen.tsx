import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Offer } from '../models/Offer';
import MapView, { Marker } from 'react-native-maps';

const OfferDetailScreen: React.FC<StackScreenProps<any>> = ({ navigation, route }) => {

  const offer : Offer = route?.params?.offer;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.scrollView} contentContainerStyle={styles.scrollViewContentContainer}>
        <View style={{padding: 20, flex: 1, width: '100%'}}>
          <Text style={{fontSize: 22, textAlign: 'center', fontWeight: 'bold'}}>{offer.company}</Text>
          <Text style={{marginTop: 10 ,fontSize: 20, textAlign: 'center', fontWeight: 'bold', fontStyle: 'italic'}}>{offer.position}</Text>
          <Text style={{marginTop: 10,fontSize: 22, textAlign: 'center', fontWeight: 'bold'}}>{offer.interview_address}</Text>
         {/* <MapView 
            region={{
              latitude: offer.job_latitude,
              longitude: offer.job_longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05
            }}
            style={{marginTop: 20, height: 225, width: '100%'}}
            >
            <Marker
              coordinate={{ latitude: offer.job_latitude , longitude: offer.job_longitude }}
            >
              <Text 
                style={{
                  fontSize: 18,
                  backgroundColor: 'orange',
                  color: 'white',
                  borderWidth: 1,
                  borderColor: '#fff',
                  padding: 10
                }}>
                {offer.job_address}
                </Text>
            </Marker>
          </MapView>*/}

          <Text style={{marginTop: 10, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Dirección</Text>
          <Text style={{marginTop: 10, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>{offer.job_address}</Text>

          <Text style={{marginTop: 20, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Horario: {offer.schedule}</Text>
          <Text style={{marginTop: 20, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Fecha de inscripción: {offer.registration_date}</Text>


          <Text style={{marginTop: 60, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Fecha de entrevista: {offer.interview_date ? offer.interview_date : 'Sin rellenar'}</Text>
          <Text style={{marginTop: 10, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Hora: {offer.interview_hour ? offer.interview_hour : 'Sin rellenar'}</Text>
          <Text style={{marginTop: 10, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Contacto: {offer.contact_person ? offer.contact_person : 'Sin rellenar'}</Text>
          <Text style={{marginTop: 10, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Dirección</Text>
          <Text style={{marginTop: 10, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>{offer.interview_address ? offer.interview_address : 'Sin rellenar'}</Text>
          
          <Text style={{marginTop: 60, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Formación necesaria: {offer.mandatory_education ? 'Sí' : 'No'}</Text>
          {
            offer.mandatory_education && 
            <Text style={{marginTop: 10, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Formación requerida: {offer.required_education}</Text>
          }
          <Text style={{marginTop: 10, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Experiencia necesaria: {offer.mandatory_experience ? 'Sí' : 'No'}</Text>
          {
            offer.mandatory_experience &&
            <Text style={{marginTop: 10, textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Experiencia requerida: {offer.required_experience}</Text>
          }
          <View style={{marginTop: 60, borderColor: 'black', borderWidth: 2, borderRadius: 5, padding: 20, width: '100%'}}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Recuerda llevar</Text>
            <Text style={{ fontSize: 16, marginTop: 10 }}>Currículum</Text>
            <Text style={{ fontSize: 16, marginTop: 10 }}>Certificado discapacidad</Text>
            <Text style={{ fontSize: 16, marginTop: 10 }}>Títulos de formación</Text>
            <Text style={{ fontSize: 16, marginTop: 10 }}>Demanda de empleo</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollView: {
    flex: 1,
    marginBottom: 20
  },

  scrollViewContentContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },

  controls: {
    flex: 1,
    flexGrow: 6,
    width: '100%',
    paddingLeft: '10%',
    paddingRight: '10%'
  },

  control: {
    width: '100%',
    marginTop: 5
  },

  error: {
    marginTop: 10,
    padding: 10,
    color: '#fff',
    backgroundColor: '#D54826FF',
  },

  buttons: {
    flex: 1,
    flexGrow: 3
  },
  
  buttonCancel: {
    backgroundColor: '#111822',
    width: '100%',
  },

  buttonSave: {
    backgroundColor: '#FFA40B',
    width: '100%',
    marginTop: 10
  },

});

export default OfferDetailScreen;
