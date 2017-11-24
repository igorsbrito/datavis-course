from flask import Flask
from flask_restful import Resource,Api
from flask_restful import reqparse
from pymongo import MongoClient 

app = Flask(__name__)

api = Api(app)

connection = MongoClient('localhost', 27017)

db = connection['ufcdatavis']

#??
parser = reqparse.RequestParser()

#Collections:
#dishes, menus e itens_menu

class Teste(Resource):
	
	@staticmethod
	def get():
		print 'Teste'
		return {'Teste':'Teste'}

class Location(Resource):

	@staticmethod
	def get():

		menu_collection = db['menus']

		data = menu_collection.find({}, {'_id': False})

		restaurents = []

		for element in data:
			if element['name'] != "":
				restaurents.append(element)
		# 	#restaurents.insert({'name':element.name, 'lat':element.lat,'lon':element.lon})	
		# 	restaurents.insert({'name':element.name, 'sponsor': element.sponsor,'location':element.location})

		return restaurents

class ItensRestaurant(Resource):

	@staticmethod
	def get(id_place):

		print type(id_place)

		itens_menu_collection = db['itens_menu']

		data = itens_menu_collection.find({'menu_id':int(id_place)},{'_id':False})

		print data.count()
		itens = []

		for element  in data:
			itens.append(element)

		return itens

api.add_resource(Teste,'/teste/', endpoint='teste')
api.add_resource(Location, '/locations/', endpoint='get_locations')
api.add_resource(ItensRestaurant, '/restaurant/itens/<string:id_place>/', endpoint='dishes')

app.run(host='0.0.0.0', port=8000, debug=True)