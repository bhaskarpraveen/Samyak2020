import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../server';


//assertion style
chai.should();
chai.use(chaiHttp);


describe('Users Module',()=>{

    describe('POST /users/register',()=>{
        it('should register a user',(done)=>{
            let credentials={
                email:'praveennaidu264@gmail.com',
                password:'helloworld',
                name: 'Bhaskar Praveen Naidu',
                mobile: 8464877285,
                college: 'KLU',
                current_year: 3,
                branch: 'CSE',
                gender: 'Male',
                college_id: 180030026
            }
           
            chai.request(server)
                .post('/users/register')
                .send(credentials)
                .end((err,response)=>{                 
                    response.should.have.status(200);
                    done();
                })

        })

        it('If user already exists',(done)=>{
            let credentials={
                email:'praveennaidu264@gmail.com',
                password:'helloworld',
                name: 'Bhaskar Praveen Naidu',
                mobile: 8464877285,
                college: 'KLU',
                current_year: 3,
                branch: 'CSE',
                gender: 'Male',
                college_id: 180030026
            }
           
            chai.request(server)
                .post('/users/register')
                .send(credentials)
                .end((err,response)=>{                 
                    response.should.have.status(501);
                    done();
                })
        })


        it('if all details aren\'t entered',(done)=>{
            let credentials={
                email:'',
                password:'helloworld',
                name: 'Bhaskar Praveen Naidu',
                mobile: 8464877285,
                college: 'KLU',
                current_year: 3,
                branch: 'CSE',
                gender: 'Male',
                college_id: 180030026
            }
           
            chai.request(server)
                .post('/users/register')
                .send(credentials)
                .end((err,response)=>{                 
                    response.should.have.status(400);
                    done();
                })
             } )
        
    })

    describe('POST /users/login',()=>{
        it('should login a user',(done)=>{
            let credentials={
                email:'praveennaidu264@gmail.com',
                password:'helloworld',
            }
           
            chai.request(server)
                .post('/users/login')
                .send(credentials)
                .end((err,response)=>{                 
                    response.should.have.status(501);
                    done();
                })

        })

        it('Invalid login credentials',(done)=>{
            let credentials={
                email:'praveennaidu264@gmail.com',
                password:'helloworld2',
            }
           
            chai.request(server)
                .post('/users/login')
                .send(credentials)
                .end((err,response)=>{                 
                    response.should.have.status(501);
                    done();
                })

        })
        it('Empty credentials',(done)=>{
            let credentials={
                // email:'praveennaidu264@gmail.com',
                // password:'',
            }
           
            chai.request(server)
                .post('/users/login')
                .send(credentials)
                .end((err,response)=>{                 
                    response.should.have.status(400);
                    done();
                })

        })
    })
})