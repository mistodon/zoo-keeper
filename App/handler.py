import os

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template

class ZooHandler(webapp.RequestHandler):
    def render_page(self,fname,data):
        path = os.path.join(os.path.dirname(__file__), fname)
        self.response.out.write(template.render(path, data))
